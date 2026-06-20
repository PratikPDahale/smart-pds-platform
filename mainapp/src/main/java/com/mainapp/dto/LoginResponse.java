package com.mainapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private UserResponseDTO user;
    private CitizenResponse citizenProfile;  // null if not a citizen
    private DealerResponse dealerProfile;    // null if not a dealer
    private AdminResponse adminProfile;      // null if not an admin
    private String message;
}
