package com.mainapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull(message = "Dealer ID is required")
    private Long dealerId;

    @Column(nullable = false)
    @NotNull(message = "Product ID is required")
    private Long productId;

    @Column(nullable = false)
    @DecimalMin(value = "0.0", message = "Predicted demand cannot be negative")
    private Double predictedDemand;

    @Column(nullable = false, length = 20)
    @NotBlank(message = "Prediction month is required (e.g., 2025-01)")
    private String predictionMonth; // Format: YYYY-MM

    @Column(length = 50)
    private String algorithm = "SIMPLE_AVERAGE"; // Algorithm used for prediction

    @Column(length = 255)
    private String festivalImpact;

    @Builder.Default
    private Double festivalMultiplier = 1.0;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }
}
