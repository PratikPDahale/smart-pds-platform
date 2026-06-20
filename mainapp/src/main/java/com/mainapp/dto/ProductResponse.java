package com.mainapp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String productName;
    private String unit;
    private Double pricePerUnit;
    private String category;
    private Boolean active;
}
