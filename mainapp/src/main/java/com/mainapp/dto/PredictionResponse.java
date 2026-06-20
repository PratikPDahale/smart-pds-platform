package com.mainapp.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResponse {

    private Long id;
    private Long dealerId;
    private String dealerName;
    private Long productId;
    private String productName;
    private Double predictedDemand;
    private String predictionMonth;
    private String algorithm;
    private String festivalImpact;
    private Double festivalMultiplier;
    private LocalDateTime generatedAt;
}
