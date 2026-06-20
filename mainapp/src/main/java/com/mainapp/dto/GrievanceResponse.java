package com.mainapp.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrievanceResponse {

    private Long id;
    private Long citizenId;
    private String citizenName;
    private String rationCardNumber;
    private Long dealerId;
    private String dealerName;
    private String subject;
    private String category;
    private String description;
    private String priority;
    private String status;
    private String response;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
