package com.mainapp.service;

import com.mainapp.dto.CitizenQuotaStatus;
import com.mainapp.dto.QuotaRequest;
import com.mainapp.dto.QuotaResponse;
import com.mainapp.exception.ResourceAlreadyExistsException;
import com.mainapp.exception.ResourceNotFoundException;
import com.mainapp.model.Citizen;
import com.mainapp.model.Citizen.CitizenCategory;
import com.mainapp.model.Product;
import com.mainapp.model.Quota;
import com.mainapp.repository.CitizenRepository;
import com.mainapp.repository.DistributionRepository;
import com.mainapp.repository.ProductRepository;
import com.mainapp.repository.QuotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotaService {

    private final QuotaRepository quotaRepository;
    private final ProductRepository productRepository;
    private final CitizenRepository citizenRepository;
    private final DistributionRepository distributionRepository;

    // ================== CREATE QUOTA ==================

    @Transactional
    public QuotaResponse createQuota(QuotaRequest request) {
        // Validate product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        CitizenCategory category = CitizenCategory.valueOf(request.getCategory().toUpperCase());

        // Check if quota already exists
        if (quotaRepository.existsByProductIdAndCategoryAndMonthAndYear(
                request.getProductId(), category, request.getMonth(), request.getYear())) {
            throw new ResourceAlreadyExistsException(
                    "Quota already exists for product: " + product.getProductName() + 
                    ", category: " + category + 
                    ", month: " + request.getMonth() + 
                    ", year: " + request.getYear());
        }

        Quota quota = Quota.builder()
                .productId(request.getProductId())
                .category(category)
                .month(request.getMonth())
                .year(request.getYear())
                .quotaPerCitizen(request.getQuotaPerCitizen())
                .description(request.getDescription())
                .active(true)
                .build();

        Quota savedQuota = quotaRepository.save(quota);
        return mapToResponse(savedQuota, product);
    }

    // ================== GET QUOTA BY ID ==================

    public QuotaResponse getQuotaById(Long id) {
        Quota quota = quotaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quota not found with id: " + id));

        Product product = productRepository.findById(quota.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return mapToResponse(quota, product);
    }

    // ================== GET ALL QUOTAS ==================

    public List<QuotaResponse> getAllQuotas() {
        return quotaRepository.findAll().stream()
                .map(quota -> {
                    Product product = productRepository.findById(quota.getProductId()).orElse(null);
                    return mapToResponse(quota, product);
                })
                .toList();
    }

    // ================== GET QUOTAS BY MONTH AND YEAR ==================

    public List<QuotaResponse> getQuotasByMonthAndYear(Integer month, Integer year) {
        return quotaRepository.findByMonthAndYear(month, year).stream()
                .map(quota -> {
                    Product product = productRepository.findById(quota.getProductId()).orElse(null);
                    return mapToResponse(quota, product);
                })
                .toList();
    }

    // ================== GET ACTIVE QUOTAS ==================

    public List<QuotaResponse> getActiveQuotas() {
        return quotaRepository.findByActive(true).stream()
                .map(quota -> {
                    Product product = productRepository.findById(quota.getProductId()).orElse(null);
                    return mapToResponse(quota, product);
                })
                .toList();
    }

    // ================== UPDATE QUOTA ==================

    @Transactional
    public QuotaResponse updateQuota(Long id, QuotaRequest request) {
        Quota quota = quotaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quota not found with id: " + id));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        CitizenCategory category = CitizenCategory.valueOf(request.getCategory().toUpperCase());

        quota.setProductId(request.getProductId());
        quota.setCategory(category);
        quota.setMonth(request.getMonth());
        quota.setYear(request.getYear());
        quota.setQuotaPerCitizen(request.getQuotaPerCitizen());
        quota.setDescription(request.getDescription());

        Quota updatedQuota = quotaRepository.save(quota);
        return mapToResponse(updatedQuota, product);
    }

    // ================== DELETE QUOTA ==================

    @Transactional
    public void deleteQuota(Long id) {
        if (!quotaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Quota not found with id: " + id);
        }
        quotaRepository.deleteById(id);
    }

    // ================== TOGGLE QUOTA STATUS ==================

    @Transactional
    public QuotaResponse toggleQuotaStatus(Long id) {
        Quota quota = quotaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quota not found with id: " + id));

        quota.setActive(!quota.getActive());
        Quota updatedQuota = quotaRepository.save(quota);

        Product product = productRepository.findById(quota.getProductId()).orElse(null);
        return mapToResponse(updatedQuota, product);
    }

    // ================== CHECK CITIZEN QUOTA STATUS ==================

    public List<CitizenQuotaStatus> getCitizenQuotaStatus(String rationCardNumber, Integer month, Integer year) {
        // Find citizen
        Citizen citizen = citizenRepository.findByRationCardNumber(rationCardNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with ration card: " + rationCardNumber));

        // Get all active quotas for this category, month, and year
        List<Quota> quotas = quotaRepository.findByCategoryAndMonthAndYear(
                citizen.getCategory(), month, year).stream()
                .filter(quota -> Boolean.TRUE.equals(quota.getActive()))
                .toList();

        List<CitizenQuotaStatus> statusList = new ArrayList<>();
        Integer familySize = citizen.getFamilySize() != null ? citizen.getFamilySize() : 1;

        for (Quota quota : quotas) {
            Product product = productRepository.findById(quota.getProductId()).orElse(null);
            if (product == null) continue;

            // Calculate redeemed quantity for this month
            Double redeemedQuantity = calculateRedeemedQuantity(
                    citizen.getId(), quota.getProductId(), month, year);

            Double totalQuota = quota.getQuotaPerCitizen() * familySize;
            Double remainingQuota = totalQuota - redeemedQuantity;
            Double percentageUsed = totalQuota > 0 ? (redeemedQuantity / totalQuota) * 100 : 0.0;

            String status;
            if (remainingQuota <= 0) {
                status = "EXHAUSTED";
            } else if (percentageUsed >= 90) {
                status = "ALMOST_EXHAUSTED";
            } else {
                status = "AVAILABLE";
            }

            CitizenQuotaStatus quotaStatus = CitizenQuotaStatus.builder()
                    .productId(product.getId())
                    .productName(product.getProductName())
                    .unit(product.getUnit())
                    .category(citizen.getCategory().name())
                    .month(month)
                    .year(year)
                    .familySize(familySize)
                    .quotaPerCitizen(roundQuantity(quota.getQuotaPerCitizen()))
                    .totalQuota(roundQuantity(totalQuota))
                    .redeemedQuantity(roundQuantity(redeemedQuantity))
                    .remainingQuota(roundQuantity(Math.max(0, remainingQuota)))
                    .percentageUsed(roundQuantity(Math.min(100, percentageUsed)))
                    .status(status)
                    .build();

            statusList.add(quotaStatus);
        }

        return statusList;
    }

    // ================== CHECK CITIZEN CURRENT MONTH QUOTA ==================

    public List<CitizenQuotaStatus> getCitizenCurrentMonthQuota(String rationCardNumber) {
        LocalDateTime now = LocalDateTime.now();
        return getCitizenQuotaStatus(rationCardNumber, now.getMonthValue(), now.getYear());
    }

    // ================== CALCULATE REDEEMED QUANTITY ==================

    private Double calculateRedeemedQuantity(Long citizenId, Long productId, Integer month, Integer year) {
        // Get start and end of the month
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);

        // Sum all distributions for this citizen and product in this month
        return distributionRepository.findByCitizenIdAndProductId(citizenId, productId)
                .stream()
                .filter(dist -> {
                    LocalDateTime distDate = dist.getDistributionDate();
                    return distDate != null && !distDate.isBefore(startDate) && !distDate.isAfter(endDate);
                })
                .mapToDouble(dist -> dist.getQuantity())
                .sum();
    }

    // ================== CHECK IF QUOTA AVAILABLE ==================

    public boolean isQuotaAvailable(Long citizenId, Long productId, Double requestedQuantity, Integer month, Integer year) {
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found"));

        Quota quota = quotaRepository.findByProductIdAndCategoryAndMonthAndYear(
                productId, citizen.getCategory(), month, year)
                .orElse(null);

        if (quota == null || !quota.getActive()) {
            return true; // No quota restriction
        }

        Double redeemedQuantity = calculateRedeemedQuantity(citizenId, productId, month, year);
        Integer familySize = citizen.getFamilySize() != null ? citizen.getFamilySize() : 1;
        Double totalQuota = quota.getQuotaPerCitizen() * familySize;
        Double remainingQuota = totalQuota - redeemedQuantity;

        return remainingQuota >= requestedQuantity;
    }

    // ================== MAPPING ==================

    private QuotaResponse mapToResponse(Quota quota, Product product) {
        return QuotaResponse.builder()
                .id(quota.getId())
                .productId(quota.getProductId())
                .productName(product != null ? product.getProductName() : "Unknown")
                .category(quota.getCategory().name())
                .month(quota.getMonth())
                .year(quota.getYear())
                .quotaPerCitizen(quota.getQuotaPerCitizen())
                .unit(product != null ? product.getUnit() : "")
                .active(quota.getActive())
                .description(quota.getDescription())
                .createdAt(quota.getCreatedAt())
                .updatedAt(quota.getUpdatedAt())
                .build();
    }

    private Double roundQuantity(Double quantity) {
        if (quantity == null) {
            return 0.0;
        }

        return Math.round(quantity * 100.0) / 100.0;
    }
}
