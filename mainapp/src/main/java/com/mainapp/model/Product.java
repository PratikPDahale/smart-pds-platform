package com.mainapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    @NotBlank(message = "Product name is required")
    private String productName;

    @Transient
    private String unit; // Not present in the current legacy schema

    @Column(name = "price", nullable = false)
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private Double pricePerUnit;

    @Column(length = 50)
    private String category; // GRAIN, OIL, SUGAR, etc.

    @Column(name = "description")
    private String description;

    @Builder.Default
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

}
