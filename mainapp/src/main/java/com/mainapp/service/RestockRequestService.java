package com.mainapp.service;

import com.mainapp.dto.InventoryRequest;
import com.mainapp.dto.RestockDecisionRequest;
import com.mainapp.dto.RestockRequestCreateRequest;
import com.mainapp.dto.RestockRequestResponse;
import com.mainapp.model.*;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.DistributionRepository;
import com.mainapp.repository.InventoryRepository;
import com.mainapp.repository.ProductRepository;
import com.mainapp.repository.RestockRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestockRequestService {

    private final RestockRequestRepository restockRequestRepository;
    private final DealerRepository dealerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final DistributionRepository distributionRepository;
    private final InventoryService inventoryService;

    @Transactional
    public RestockRequestResponse createRequest(RestockRequestCreateRequest request) {
        Dealer dealer = dealerRepository.findById(request.getDealerId())
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + request.getDealerId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        if (Boolean.FALSE.equals(dealer.getActive())) {
            throw new RuntimeException("Inactive dealers cannot request stock replenishment");
        }

        RestockRequest restockRequest = RestockRequest.builder()
                .dealerId(request.getDealerId())
                .productId(request.getProductId())
                .quantity(roundQuantity(request.getQuantity()))
                .reason(request.getReason().trim())
                .status(RestockRequestStatus.PENDING)
                .build();

        RestockRequest savedRequest = restockRequestRepository.save(restockRequest);
        return mapToResponse(savedRequest, dealer, product);
    }

    public List<RestockRequestResponse> getAllRequests() {
        return restockRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RestockRequestResponse> getRequestsByStatus(RestockRequestStatus status) {
        return restockRequestRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RestockRequestResponse> getRequestsByDealer(Long dealerId) {
        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        return restockRequestRepository.findByDealerIdOrderByCreatedAtDesc(dealerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RestockRequestResponse approveRequest(Long id, RestockDecisionRequest request) {
        RestockRequest restockRequest = getPendingRequest(id);

        inventoryService.addStock(InventoryRequest.builder()
                .dealerId(restockRequest.getDealerId())
                .productId(restockRequest.getProductId())
                .quantity(restockRequest.getQuantity())
                .build());

        restockRequest.setStatus(RestockRequestStatus.APPROVED);
        restockRequest.setAdminRemarks(normalizeRemarks(request));
        restockRequest.setActionedAt(LocalDateTime.now());

        RestockRequest savedRequest = restockRequestRepository.save(restockRequest);
        return mapToResponse(savedRequest);
    }

    @Transactional
    public RestockRequestResponse rejectRequest(Long id, RestockDecisionRequest request) {
        RestockRequest restockRequest = getPendingRequest(id);
        restockRequest.setStatus(RestockRequestStatus.REJECTED);
        restockRequest.setAdminRemarks(normalizeRemarks(request));
        restockRequest.setActionedAt(LocalDateTime.now());

        RestockRequest savedRequest = restockRequestRepository.save(restockRequest);
        return mapToResponse(savedRequest);
    }

    private RestockRequest getPendingRequest(Long id) {
        RestockRequest restockRequest = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restock request not found with ID: " + id));

        if (restockRequest.getStatus() != RestockRequestStatus.PENDING) {
            throw new RuntimeException("Only pending restock requests can be reviewed");
        }

        return restockRequest;
    }

    private String normalizeRemarks(RestockDecisionRequest request) {
        if (request == null || request.getAdminRemarks() == null || request.getAdminRemarks().trim().isEmpty()) {
            return null;
        }

        return request.getAdminRemarks().trim();
    }

    private RestockRequestResponse mapToResponse(RestockRequest restockRequest) {
        Dealer dealer = dealerRepository.findById(restockRequest.getDealerId()).orElse(null);
        Product product = productRepository.findById(restockRequest.getProductId()).orElse(null);
        return mapToResponse(restockRequest, dealer, product);
    }

    private RestockRequestResponse mapToResponse(RestockRequest restockRequest, Dealer dealer, Product product) {
        Inventory inventory = inventoryRepository
                .findByDealerIdAndProductId(restockRequest.getDealerId(), restockRequest.getProductId())
                .orElse(null);
        List<Distribution> history = distributionRepository.findByDealerAndProduct(
                restockRequest.getDealerId(), restockRequest.getProductId());
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        double totalDistributed = history.stream()
                .mapToDouble(Distribution::getQuantity)
                .sum();
        double last30DaysDistributed = history.stream()
                .filter(distribution -> distribution.getDistributionDate() != null
                        && !distribution.getDistributionDate().isBefore(thirtyDaysAgo))
                .mapToDouble(Distribution::getQuantity)
                .sum();

        Double currentStock = inventory != null ? inventory.getCurrentStock() : 0.0;
        Double stockReceived = inventory != null ? inventory.getStockReceived() : 0.0;
        Double stockDistributed = inventory != null ? inventory.getStockDistributed() : 0.0;

        return RestockRequestResponse.builder()
                .id(restockRequest.getId())
                .dealerId(restockRequest.getDealerId())
                .dealerName(dealer != null ? dealer.getShopName() : "Unknown")
                .productId(restockRequest.getProductId())
                .productName(product != null ? product.getProductName() : "Unknown")
                .quantity(roundQuantity(restockRequest.getQuantity()))
                .reason(restockRequest.getReason())
                .status(restockRequest.getStatus().name())
                .adminRemarks(restockRequest.getAdminRemarks())
                .currentStock(roundQuantity(currentStock))
                .stockReceived(roundQuantity(stockReceived))
                .stockDistributed(roundQuantity(stockDistributed))
                .totalDistributed(roundQuantity(totalDistributed))
                .last30DaysDistributed(roundQuantity(last30DaysDistributed))
                .distributionCount((long) history.size())
                .reviewHint(buildReviewHint(restockRequest, currentStock, last30DaysDistributed))
                .createdAt(restockRequest.getCreatedAt())
                .updatedAt(restockRequest.getUpdatedAt())
                .actionedAt(restockRequest.getActionedAt())
                .build();
    }

    private String buildReviewHint(RestockRequest request, Double currentStock, Double last30DaysDistributed) {
        String reason = request.getReason() == null ? "" : request.getReason().toLowerCase(Locale.ROOT);

        if (currentStock < 50 || last30DaysDistributed >= request.getQuantity() * 0.75) {
            return "Strong case: low stock or recent distribution history supports replenishment.";
        }

        if (reason.contains("urgent") || reason.contains("festival") || reason.contains("demand")
                || reason.contains("shortage")) {
            return "Review reason: request cites operational demand; compare with recent distribution.";
        }

        return "Review carefully: distribution history is modest for the requested quantity.";
    }

    private Double roundQuantity(Double quantity) {
        if (quantity == null) {
            return 0.0;
        }

        return Math.round(quantity * 100.0) / 100.0;
    }
}
