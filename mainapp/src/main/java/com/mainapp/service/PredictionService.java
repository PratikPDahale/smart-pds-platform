package com.mainapp.service;

import com.mainapp.dto.PredictionRequest;
import com.mainapp.dto.PredictionResponse;
import com.mainapp.model.Dealer;
import com.mainapp.model.Distribution;
import com.mainapp.model.Product;
import com.mainapp.model.StockPrediction;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.DistributionRepository;
import com.mainapp.repository.ProductRepository;
import com.mainapp.repository.StockPredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final StockPredictionRepository predictionRepository;
    private final DistributionRepository distributionRepository;
    private final DealerRepository dealerRepository;
    private final ProductRepository productRepository;

    @Transactional
    public PredictionResponse generatePrediction(PredictionRequest request) {
        // Validate dealer and product
        Dealer dealer = dealerRepository.findById(request.getDealerId())
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + request.getDealerId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        YearMonth targetMonth = parsePredictionMonth(request.getPredictionMonth());

        List<Distribution> historicalDistributions = distributionRepository.findByDealerAndProduct(
                request.getDealerId(), request.getProductId());

        ForecastResult forecast = calculateFestivalAwareForecast(historicalDistributions, product, targetMonth);

        // Check if prediction already exists for this month
        predictionRepository.findByDealerIdAndProductIdAndPredictionMonth(
                request.getDealerId(), request.getProductId(), request.getPredictionMonth())
                .ifPresent(existing -> predictionRepository.delete(existing));

        // Create new prediction
        StockPrediction prediction = StockPrediction.builder()
                .dealerId(request.getDealerId())
                .productId(request.getProductId())
                .predictedDemand(forecast.predictedDemand())
                .predictionMonth(request.getPredictionMonth())
                .algorithm(forecast.algorithm())
                .festivalImpact(forecast.festivalImpact())
                .festivalMultiplier(forecast.festivalMultiplier())
                .generatedAt(LocalDateTime.now())
                .build();

        StockPrediction savedPrediction = predictionRepository.save(prediction);
        return mapToPredictionResponse(savedPrediction, dealer, product);
    }

    @Transactional
    public List<PredictionResponse> generatePredictionsForDealer(Long dealerId, String predictionMonth) {
        // Validate dealer
        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        // Current schema does not persist a product activation flag, so use all products.
        List<Product> products = productRepository.findAll();

        return products.stream()
                .map(product -> {
                    PredictionRequest request = PredictionRequest.builder()
                            .dealerId(dealerId)
                            .productId(product.getId())
                            .predictionMonth(predictionMonth)
                            .build();
                    return generatePrediction(request);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PredictionResponse> generateFuturePredictionsForDealer(Long dealerId, int months) {
        if (months < 1 || months > 24) {
            throw new RuntimeException("Future prediction range must be between 1 and 24 months");
        }

        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        YearMonth nextMonth = YearMonth.now().plusMonths(1);
        return IntStream.range(0, months)
                .mapToObj(offset -> generatePredictionsForDealer(dealerId, nextMonth.plusMonths(offset).toString()))
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }

    public PredictionResponse getPredictionById(Long id) {
        StockPrediction prediction = predictionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prediction not found with ID: " + id));

        Dealer dealer = dealerRepository.findById(prediction.getDealerId()).orElse(null);
        Product product = productRepository.findById(prediction.getProductId()).orElse(null);

        return mapToPredictionResponse(prediction, dealer, product);
    }

    public List<PredictionResponse> getPredictionsByDealer(Long dealerId) {
        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        return predictionRepository.findByDealerId(dealerId).stream()
                .map(prediction -> {
                    Dealer dealer = dealerRepository.findById(prediction.getDealerId()).orElse(null);
                    Product product = productRepository.findById(prediction.getProductId()).orElse(null);
                    return mapToPredictionResponse(prediction, dealer, product);
                })
                .collect(Collectors.toList());
    }

    public List<PredictionResponse> getPredictionsByMonth(String predictionMonth) {
        return predictionRepository.findByPredictionMonth(predictionMonth).stream()
                .map(prediction -> {
                    Dealer dealer = dealerRepository.findById(prediction.getDealerId()).orElse(null);
                    Product product = productRepository.findById(prediction.getProductId()).orElse(null);
                    return mapToPredictionResponse(prediction, dealer, product);
                })
                .collect(Collectors.toList());
    }

    public List<PredictionResponse> getAllPredictions() {
        return predictionRepository.findAll().stream()
                .map(prediction -> {
                    Dealer dealer = dealerRepository.findById(prediction.getDealerId()).orElse(null);
                    Product product = productRepository.findById(prediction.getProductId()).orElse(null);
                    return mapToPredictionResponse(prediction, dealer, product);
                })
                .collect(Collectors.toList());
    }

    private ForecastResult calculateFestivalAwareForecast(List<Distribution> distributions,
                                                          Product product,
                                                          YearMonth targetMonth) {
        Map<YearMonth, Double> monthlyDemand = buildMonthlyDemandSeries(distributions, targetMonth);
        FestivalAdjustment festivalAdjustment = calculateFestivalAdjustment(product, targetMonth);

        if (monthlyDemand.isEmpty()) {
            return new ForecastResult(0.0, "HOLT_TREND_FESTIVAL_AWARE", festivalAdjustment.description(),
                    festivalAdjustment.multiplier());
        }

        double baseline = calculateHoltLinearForecast(monthlyDemand, targetMonth);
        double seasonalBaseline = calculateSeasonalBaseline(monthlyDemand, targetMonth);
        double blendedBaseline = monthlyDemand.size() >= 6
                ? (baseline * 0.70) + (seasonalBaseline * 0.30)
                : calculateWeightedMovingAverage(monthlyDemand);
        double predictedDemand = Math.max(0.0, roundToTwoDecimals(blendedBaseline * festivalAdjustment.multiplier()));

        return new ForecastResult(predictedDemand, "HOLT_TREND_SEASONAL_FESTIVAL_AWARE",
                festivalAdjustment.description(), festivalAdjustment.multiplier());
    }

    private Map<YearMonth, Double> buildMonthlyDemandSeries(List<Distribution> distributions, YearMonth targetMonth) {
        YearMonth startMonth = targetMonth.minusMonths(18);
        Map<YearMonth, Double> grouped = distributions.stream()
                .filter(distribution -> "COMPLETED".equalsIgnoreCase(distribution.getStatus()))
                .filter(distribution -> distribution.getDistributionDate() != null)
                .filter(distribution -> YearMonth.from(distribution.getDistributionDate()).isBefore(targetMonth))
                .filter(distribution -> !YearMonth.from(distribution.getDistributionDate()).isBefore(startMonth))
                .collect(Collectors.groupingBy(
                        distribution -> YearMonth.from(distribution.getDistributionDate()),
                        Collectors.summingDouble(Distribution::getQuantity)));

        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> left,
                        LinkedHashMap::new));
    }

    private double calculateHoltLinearForecast(Map<YearMonth, Double> monthlyDemand, YearMonth targetMonth) {
        List<Map.Entry<YearMonth, Double>> entries = new ArrayList<>(monthlyDemand.entrySet());
        entries.sort(Map.Entry.comparingByKey());

        if (entries.size() == 1) {
            return entries.get(0).getValue();
        }

        double alpha = 0.55;
        double beta = 0.25;
        double level = entries.get(0).getValue();
        double trend = entries.get(1).getValue() - entries.get(0).getValue();

        for (int index = 1; index < entries.size(); index++) {
            double actual = entries.get(index).getValue();
            double previousLevel = level;
            level = (alpha * actual) + ((1 - alpha) * (level + trend));
            trend = (beta * (level - previousLevel)) + ((1 - beta) * trend);
        }

        YearMonth lastObservedMonth = entries.get(entries.size() - 1).getKey();
        long monthsAhead = Math.max(1, lastObservedMonth.until(targetMonth, java.time.temporal.ChronoUnit.MONTHS));
        return Math.max(0.0, level + (trend * monthsAhead));
    }

    private double calculateSeasonalBaseline(Map<YearMonth, Double> monthlyDemand, YearMonth targetMonth) {
        List<Double> sameMonthDemand = monthlyDemand.entrySet().stream()
                .filter(entry -> entry.getKey().getMonth() == targetMonth.getMonth())
                .map(Map.Entry::getValue)
                .toList();

        if (!sameMonthDemand.isEmpty()) {
            return sameMonthDemand.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        }

        return calculateWeightedMovingAverage(monthlyDemand);
    }

    private double calculateWeightedMovingAverage(Map<YearMonth, Double> monthlyDemand) {
        List<Double> recentDemand = monthlyDemand.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.reverseOrder()))
                .limit(6)
                .map(Map.Entry::getValue)
                .toList();

        double weightedTotal = 0.0;
        double weightTotal = 0.0;
        for (int index = 0; index < recentDemand.size(); index++) {
            double weight = recentDemand.size() - index;
            weightedTotal += recentDemand.get(index) * weight;
            weightTotal += weight;
        }

        return weightTotal == 0.0 ? 0.0 : weightedTotal / weightTotal;
    }

    private FestivalAdjustment calculateFestivalAdjustment(Product product, YearMonth targetMonth) {
        List<FestivalEvent> festivals = FESTIVAL_CALENDAR.stream()
                .filter(festival -> YearMonth.from(festival.date()).equals(targetMonth))
                .toList();

        if (festivals.isEmpty()) {
            return new FestivalAdjustment("No major festival uplift", 1.0);
        }

        String productText = ((product.getProductName() == null ? "" : product.getProductName()) + " "
                + (product.getCategory() == null ? "" : product.getCategory())).toLowerCase(Locale.ROOT);

        double multiplier = 1.0;
        List<String> names = new ArrayList<>();
        for (FestivalEvent festival : festivals) {
            names.add(festival.name());
            multiplier += festival.baseUplift() + productSpecificUplift(productText, festival);
        }

        multiplier = Math.min(multiplier, 1.65);
        return new FestivalAdjustment(String.join(", ", names), roundToTwoDecimals(multiplier));
    }

    private double productSpecificUplift(String productText, FestivalEvent festival) {
        if (productText.contains("sugar") || productText.contains("oil") || productText.contains("ghee")) {
            return festival.foodPreparationUplift();
        }

        if (productText.contains("rice") || productText.contains("wheat") || productText.contains("grain")
                || productText.contains("atta") || productText.contains("dal") || productText.contains("pulse")) {
            return festival.stapleUplift();
        }

        return 0.04;
    }

    private YearMonth parsePredictionMonth(String predictionMonth) {
        try {
            return YearMonth.parse(predictionMonth);
        } catch (RuntimeException exception) {
            throw new RuntimeException("Prediction month must use YYYY-MM format");
        }
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private PredictionResponse mapToPredictionResponse(StockPrediction prediction, 
                                                       Dealer dealer, 
                                                       Product product) {
        return PredictionResponse.builder()
                .id(prediction.getId())
                .dealerId(prediction.getDealerId())
                .dealerName(dealer != null ? dealer.getShopName() : "Unknown")
                .productId(prediction.getProductId())
                .productName(product != null ? product.getProductName() : "Unknown")
                .predictedDemand(prediction.getPredictedDemand())
                .predictionMonth(prediction.getPredictionMonth())
                .algorithm(prediction.getAlgorithm())
                .festivalImpact(prediction.getFestivalImpact())
                .festivalMultiplier(prediction.getFestivalMultiplier() == null ? 1.0 : prediction.getFestivalMultiplier())
                .generatedAt(prediction.getGeneratedAt())
                .build();
    }

    private record ForecastResult(Double predictedDemand, String algorithm, String festivalImpact,
                                  Double festivalMultiplier) {
    }

    private record FestivalAdjustment(String description, double multiplier) {
    }

    private record FestivalEvent(String name, LocalDate date, double baseUplift, double stapleUplift,
                                 double foodPreparationUplift) {
    }

    private static final List<FestivalEvent> FESTIVAL_CALENDAR = List.of(
            new FestivalEvent("Holi", LocalDate.of(2026, 3, 4), 0.10, 0.08, 0.16),
            new FestivalEvent("Eid-ul-Fitr", LocalDate.of(2026, 3, 21), 0.08, 0.06, 0.12),
            new FestivalEvent("Bakrid", LocalDate.of(2026, 5, 27), 0.07, 0.05, 0.10),
            new FestivalEvent("Raksha Bandhan", LocalDate.of(2026, 8, 28), 0.06, 0.04, 0.10),
            new FestivalEvent("Dussehra", LocalDate.of(2026, 10, 20), 0.11, 0.08, 0.13),
            new FestivalEvent("Diwali", LocalDate.of(2026, 11, 8), 0.18, 0.10, 0.22),
            new FestivalEvent("Christmas", LocalDate.of(2026, 12, 25), 0.07, 0.04, 0.09),
            new FestivalEvent("Holi", LocalDate.of(2027, 3, 22), 0.10, 0.08, 0.16),
            new FestivalEvent("Eid-ul-Fitr", LocalDate.of(2027, 3, 10), 0.08, 0.06, 0.12),
            new FestivalEvent("Raksha Bandhan", LocalDate.of(2027, 8, 17), 0.06, 0.04, 0.10),
            new FestivalEvent("Dussehra", LocalDate.of(2027, 10, 9), 0.11, 0.08, 0.13),
            new FestivalEvent("Diwali", LocalDate.of(2027, 10, 29), 0.18, 0.10, 0.22),
            new FestivalEvent("Christmas", LocalDate.of(2027, 12, 25), 0.07, 0.04, 0.09),
            new FestivalEvent("Holi", LocalDate.of(2028, 3, 11), 0.10, 0.08, 0.16),
            new FestivalEvent("Eid-ul-Fitr", LocalDate.of(2028, 2, 27), 0.08, 0.06, 0.12),
            new FestivalEvent("Raksha Bandhan", LocalDate.of(2028, 8, 5), 0.06, 0.04, 0.10),
            new FestivalEvent("Dussehra", LocalDate.of(2028, 9, 27), 0.11, 0.08, 0.13),
            new FestivalEvent("Diwali", LocalDate.of(2028, 10, 17), 0.18, 0.10, 0.22),
            new FestivalEvent("Christmas", LocalDate.of(2028, 12, 25), 0.07, 0.04, 0.09)
    );
}
