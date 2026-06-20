package com.mainapp.dto;

import com.mainapp.model.GrievanceStatus;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrievanceStatusRequest {

    @NotNull(message = "Status is required")
    private GrievanceStatus status;

    @Size(max = 1000, message = "Response cannot exceed 1000 characters")
    private String response;
}
