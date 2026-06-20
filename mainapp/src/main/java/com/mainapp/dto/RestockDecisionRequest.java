package com.mainapp.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestockDecisionRequest {

    @Size(max = 500, message = "Admin remarks cannot exceed 500 characters")
    private String adminRemarks;
}
