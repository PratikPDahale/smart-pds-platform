package com.mainapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponse {
    private Long id;
    private Long userId;
    private String department;
    private String designation;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
