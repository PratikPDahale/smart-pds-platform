package com.mainapp.service;

import com.mainapp.dto.InventoryRequest;
import com.mainapp.dto.InventoryResponse;
import com.mainapp.model.Dealer;
import com.mainapp.model.Inventory;
import com.mainapp.model.Product;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.InventoryRepository;
import com.mainapp.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final DealerRepository dealerRepository;
    private final ProductRepository productRepository;

    @Transactional
    public InventoryResponse addStock(InventoryRequest request) {
        // Validate dealer and product
        Dealer dealer = dealerRepository.findById(request.getDealerId())
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + request.getDealerId()));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        // Find or create inventory record
        Inventory inventory = inventoryRepository.findByDealerIdAndProductId(
                request.getDealerId(), request.getProductId())
                .orElse(Inventory.builder()
                        .dealerId(request.getDealerId())
                        .productId(request.getProductId())
                        .currentStock(0.0)
                        .openingStock(0.0)
                        .stockReceived(0.0)
                        .stockDistributed(0.0)
                        .build());

        // Update stock
        inventory.setStockReceived(roundQuantity(inventory.getStockReceived() + request.getQuantity()));
        inventory.setCurrentStock(roundQuantity(inventory.getCurrentStock() + request.getQuantity()));
        inventory.setLastUpdated(LocalDateTime.now());

        Inventory savedInventory = inventoryRepository.save(inventory);
        return mapToInventoryResponse(savedInventory, dealer, product);
    }

    @Transactional
    public InventoryResponse deductStock(Long dealerId, Long productId, Double quantity) {
        Inventory inventory = inventoryRepository.findByDealerIdAndProductId(dealerId, productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for dealer " + 
                        dealerId + " and product " + productId));

        if (inventory.getCurrentStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + 
                    inventory.getCurrentStock() + ", Required: " + quantity);
        }

        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        inventory.setStockDistributed(roundQuantity(inventory.getStockDistributed() + quantity));
        inventory.setCurrentStock(roundQuantity(inventory.getCurrentStock() - quantity));
        inventory.setLastUpdated(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);
        return mapToInventoryResponse(updatedInventory, dealer, product);
    }

    public InventoryResponse checkStock(Long dealerId, Long productId) {
        Inventory inventory = inventoryRepository.findByDealerIdAndProductId(dealerId, productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for dealer " + 
                        dealerId + " and product " + productId));

        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return mapToInventoryResponse(inventory, dealer, product);
    }

    public List<InventoryResponse> getInventoryByDealer(Long dealerId) {
        // Validate dealer exists
        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        return inventoryRepository.findByDealerId(dealerId).stream()
                .map(inventory -> {
                    Dealer dealer = dealerRepository.findById(inventory.getDealerId()).orElse(null);
                    Product product = productRepository.findById(inventory.getProductId()).orElse(null);
                    return mapToInventoryResponse(inventory, dealer, product);
                })
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(inventory -> {
                    Dealer dealer = dealerRepository.findById(inventory.getDealerId()).orElse(null);
                    Product product = productRepository.findById(inventory.getProductId()).orElse(null);
                    return mapToInventoryResponse(inventory, dealer, product);
                })
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getLowStockAlerts(Double threshold) {
        return inventoryRepository.findLowStockInventory(threshold).stream()
                .map(inventory -> {
                    Dealer dealer = dealerRepository.findById(inventory.getDealerId()).orElse(null);
                    Product product = productRepository.findById(inventory.getProductId()).orElse(null);
                    return mapToInventoryResponse(inventory, dealer, product);
                })
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getLowStockByDealer(Long dealerId, Double threshold) {
        return inventoryRepository.findLowStockByDealer(dealerId, threshold).stream()
                .map(inventory -> {
                    Dealer dealer = dealerRepository.findById(inventory.getDealerId()).orElse(null);
                    Product product = productRepository.findById(inventory.getProductId()).orElse(null);
                    return mapToInventoryResponse(inventory, dealer, product);
                })
                .collect(Collectors.toList());
    }

    private Double roundQuantity(Double quantity) {
        return Math.round(quantity * 100.0) / 100.0;
    }

    private InventoryResponse mapToInventoryResponse(Inventory inventory, Dealer dealer, Product product) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .dealerId(inventory.getDealerId())
                .dealerName(dealer != null ? dealer.getShopName() : "Unknown")
                .productId(inventory.getProductId())
                .productName(product != null ? product.getProductName() : "Unknown")
                .currentStock(roundQuantity(inventory.getCurrentStock()))
                .openingStock(roundQuantity(inventory.getOpeningStock()))
                .stockReceived(roundQuantity(inventory.getStockReceived()))
                .stockDistributed(roundQuantity(inventory.getStockDistributed()))
                .lastUpdated(inventory.getLastUpdated())
                .build();
    }
}
