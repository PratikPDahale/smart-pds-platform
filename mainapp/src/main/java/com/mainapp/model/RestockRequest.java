package com.mainapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "restock_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestockRequest {

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
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than 0")
    private Double quantity;

    @Column(nullable = false, length = 500)
    @NotBlank(message = "Reason is required")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RestockRequestStatus status = RestockRequestStatus.PENDING;

    @Column(length = 500)
    private String adminRemarks;

    @Column
    private LocalDateTime actionedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = RestockRequestStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
