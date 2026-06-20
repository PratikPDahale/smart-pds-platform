package com.mainapp.service;

import com.mainapp.dto.ProductRequest;
import com.mainapp.dto.ProductResponse;
import com.mainapp.model.Product;
import com.mainapp.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        // Check if product already exists
        if (productRepository.existsByProductName(request.getProductName())) {
            throw new RuntimeException("Product with name " + 
                    request.getProductName() + " already exists");
        }

        Product product = Product.builder()
                .productName(request.getProductName())
                .unit(request.getUnit() != null ? request.getUnit().toUpperCase() : null)
                .pricePerUnit(request.getPricePerUnit())
                .category(request.getCategory() != null ? request.getCategory().toUpperCase() : null)
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        return mapToProductResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getActiveProducts() {
        return getAllProducts();
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategory(category.toUpperCase()).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        product.setProductName(request.getProductName());
        product.setUnit(request.getUnit() != null ? request.getUnit().toUpperCase() : null);
        product.setPricePerUnit(request.getPricePerUnit());
        product.setCategory(request.getCategory() != null ? request.getCategory().toUpperCase() : null);

        Product updatedProduct = productRepository.save(product);
        return mapToProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductResponse toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        // The current database schema does not persist product activation state.
        // Return the product as-is so existing clients keep working.
        return mapToProductResponse(product);
    }

    // Helper method
    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .unit(product.getUnit() != null ? product.getUnit() : "N/A")
                .pricePerUnit(product.getPricePerUnit())
                .category(product.getCategory())
                .active(true)
                .build();
    }
}
