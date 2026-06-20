package com.mainapp.service;

import com.mainapp.dto.DistributionRequest;
import com.mainapp.dto.DistributionResponse;
import com.mainapp.model.Citizen;
import com.mainapp.model.Dealer;
import com.mainapp.model.Distribution;
import com.mainapp.model.Product;
import com.mainapp.repository.CitizenRepository;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.DistributionRepository;
import com.mainapp.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DistributionService {

    private final DistributionRepository distributionRepository;
    private final CitizenRepository citizenRepository;
    private final DealerRepository dealerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final QuotaService quotaService;

    @Transactional
    public DistributionResponse distributeRation(DistributionRequest request) {
        // 1. Verify citizen by ration card
        Citizen citizen = citizenRepository.findByRationCardNumber(request.getRationCardNumber())
                .orElseThrow(() -> new RuntimeException("Citizen not found with ration card: " + 
                        request.getRationCardNumber()));

        // 2. Verify dealer
        Dealer dealer = dealerRepository.findById(request.getDealerId())
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + request.getDealerId()));

        if (!dealer.getActive()) {
            throw new RuntimeException("Dealer is not active");
        }

        // 3. Verify product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        // 4. Check inventory stock
        try {
            inventoryService.checkStock(request.getDealerId(), request.getProductId());
        } catch (RuntimeException e) {
            throw new RuntimeException("Inventory check failed: " + e.getMessage());
        }

        // 5. Check quota availability (NEW: Validates monthly quota)
        LocalDateTime now = LocalDateTime.now();
        boolean quotaAvailable = quotaService.isQuotaAvailable(
                citizen.getId(), 
                request.getProductId(), 
                request.getQuantity(),
                now.getMonthValue(),
                now.getYear()
        );
        
        if (!quotaAvailable) {
            throw new RuntimeException("Quota exceeded for this month. Check your monthly quota balance.");
        }

        // 6. Calculate total amount
        Double totalAmount = request.getQuantity() * product.getPricePerUnit();

        // 7. Deduct stock from inventory
        inventoryService.deductStock(request.getDealerId(), request.getProductId(), request.getQuantity());

        // 8. Create distribution record
        Distribution distribution = Distribution.builder()
                .citizenId(citizen.getId())
                .dealerId(request.getDealerId())
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .totalAmount(totalAmount)
                .distributionDate(LocalDateTime.now())
                .status("COMPLETED")
                .remarks(request.getRemarks())
                .build();

        Distribution savedDistribution = distributionRepository.save(distribution);
        return mapToDistributionResponse(savedDistribution, citizen, dealer, product);
    }

    public DistributionResponse getDistributionById(Long id) {
        Distribution distribution = distributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Distribution not found with ID: " + id));

        return mapToDistributionResponse(distribution);
    }

    public List<DistributionResponse> getAllDistributions() {
        return distributionRepository.findAll().stream()
                .map(this::mapToDistributionResponse)
                .collect(Collectors.toList());
    }

    public List<DistributionResponse> getDistributionsByCitizen(Long citizenId) {
        // Validate citizen exists
        citizenRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found with ID: " + citizenId));

        return distributionRepository.findByCitizenId(citizenId).stream()
                .map(this::mapToDistributionResponse)
                .collect(Collectors.toList());
    }

    public List<DistributionResponse> getDistributionsByRationCard(String rationCardNumber) {
        Citizen citizen = citizenRepository.findByRationCardNumber(rationCardNumber)
                .orElseThrow(() -> new RuntimeException("Citizen not found with ration card: " + rationCardNumber));

        return distributionRepository.findByCitizenId(citizen.getId()).stream()
                .map(this::mapToDistributionResponse)
                .collect(Collectors.toList());
    }

    public List<DistributionResponse> getDistributionsByDealer(Long dealerId) {
        // Validate dealer exists
        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        return distributionRepository.findByDealerId(dealerId).stream()
                .map(this::mapToDistributionResponse)
                .collect(Collectors.toList());
    }

    public List<DistributionResponse> getDistributionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return distributionRepository.findByDateRange(startDate, endDate).stream()
                .map(this::mapToDistributionResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private DistributionResponse mapToDistributionResponse(Distribution distribution) {
        Citizen citizen = citizenRepository.findById(distribution.getCitizenId()).orElse(null);
        Dealer dealer = dealerRepository.findById(distribution.getDealerId()).orElse(null);
        Product product = productRepository.findById(distribution.getProductId()).orElse(null);

        return mapToDistributionResponse(distribution, citizen, dealer, product);
    }

    private DistributionResponse mapToDistributionResponse(Distribution distribution, 
                                                           Citizen citizen, 
                                                           Dealer dealer, 
                                                           Product product) {
        return DistributionResponse.builder()
                .id(distribution.getId())
                .citizenId(distribution.getCitizenId())
                .citizenName(citizen != null && citizen.getUser() != null ? citizen.getUser().getFullName() : "Unknown")
                .rationCardNumber(citizen != null ? citizen.getRationCardNumber() : "Unknown")
                .dealerId(distribution.getDealerId())
                .dealerName(dealer != null ? dealer.getShopName() : "Unknown")
                .productId(distribution.getProductId())
                .productName(product != null ? product.getProductName() : "Unknown")
                .quantity(distribution.getQuantity())
                .totalAmount(distribution.getTotalAmount())
                .distributionDate(distribution.getDistributionDate())
                .status(distribution.getStatus())
                .remarks(distribution.getRemarks())
                .build();
    }
}
