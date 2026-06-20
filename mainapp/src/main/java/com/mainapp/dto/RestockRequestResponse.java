package com.mainapp.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestockRequestResponse {

    private Long id;
    private Long dealerId;
    private String dealerName;
    private Long productId;
    private String productName;
    private Double quantity;
    private String reason;
    private String status;
    private String adminRemarks;
    private Double currentStock;
    private Double stockReceived;
    private Double stockDistributed;
    private Double totalDistributed;
    private Double last30DaysDistributed;
    private Long distributionCount;
    private String reviewHint;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime actionedAt;
}
