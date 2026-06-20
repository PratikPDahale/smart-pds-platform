package com.mainapp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenQuotaStatus {

    private Long productId;
    private String productName;
    private String unit;
    private String category;
    private Integer month;
    private Integer year;
    private Integer familySize;
    private Double quotaPerCitizen;
    private Double totalQuota;
    private Double redeemedQuantity;
    private Double remainingQuota;
    private Double percentageUsed;
    private String status; // AVAILABLE, EXHAUSTED, NOT_SET
}
