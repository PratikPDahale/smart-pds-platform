package com.mainapp.service;

import com.mainapp.dto.AdminResponse;
import com.mainapp.dto.CitizenResponse;
import com.mainapp.dto.DealerResponse;
import com.mainapp.dto.LoginRequest;
import com.mainapp.dto.LoginResponse;
import com.mainapp.dto.UserResponseDTO;
import com.mainapp.exception.ResourceNotFoundException;
import com.mainapp.model.AdminProfile;
import com.mainapp.model.Citizen;
import com.mainapp.model.Dealer;
import com.mainapp.model.User;
import com.mainapp.model.User.UserRole;
import com.mainapp.repository.AdminProfileRepository;
import com.mainapp.repository.CitizenRepository;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final DealerRepository dealerRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));

        // Verify password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid username or password");
        }

        // Check if user is active
        if (!user.getActive()) {
            throw new RuntimeException("Account is deactivated. Please contact administrator.");
        }

        // Build base response with user info
        LoginResponse response = LoginResponse.builder()
                .user(mapUserToDTO(user))
                .message("Login successful")
                .build();

        // Fetch profile based on role
        if (user.getRole() == UserRole.CITIZEN) {
            Citizen citizen = citizenRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Citizen profile not found"));
            response.setCitizenProfile(mapCitizenToResponse(citizen));
            
        } else if (user.getRole() == UserRole.DEALER) {
            Dealer dealer = dealerRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dealer profile not found"));
            response.setDealerProfile(mapDealerToResponse(dealer));
            
        } else if (user.getRole() == UserRole.ADMIN) {
            AdminProfile adminProfile = adminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));
            response.setAdminProfile(mapAdminToResponse(adminProfile));
        }

        return response;
    }

    private UserResponseDTO mapUserToDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .aadhaarRef(user.getAadhaarRef())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private CitizenResponse mapCitizenToResponse(Citizen citizen) {
        CitizenResponse response = CitizenResponse.builder()
                .id(citizen.getId())
                .userId(citizen.getUser().getId())
                .username(citizen.getUser().getUsername())
                .fullName(citizen.getUser().getFullName())
                .email(citizen.getUser().getEmail())
                .rationCardNumber(citizen.getRationCardNumber())
                .address(citizen.getAddress())
                .phoneNumber(citizen.getPhoneNumber())
                .familySize(citizen.getFamilySize())
                .category(citizen.getCategory())
                .createdAt(citizen.getCreatedAt())
                .build();

        if (citizen.getAssignedDealer() != null) {
            response.setDealerId(citizen.getAssignedDealer().getId());
            response.setDealerShopName(citizen.getAssignedDealer().getShopName());
        }

        return response;
    }

    private DealerResponse mapDealerToResponse(Dealer dealer) {
        return DealerResponse.builder()
                .id(dealer.getId())
                .userId(dealer.getUser().getId())
                .username(dealer.getUser().getUsername())
                .fullName(dealer.getUser().getFullName())
                .email(dealer.getUser().getEmail())
                .shopName(dealer.getShopName())
                .shopLicense(dealer.getShopLicense())
                .address(dealer.getAddress())
                .phoneNumber(dealer.getPhoneNumber())
                .region(dealer.getRegion())
                .active(dealer.getActive())
                .status(dealer.getStatus().name())  // Convert enum to String
                .createdAt(dealer.getCreatedAt())
                .build();
    }

    private AdminResponse mapAdminToResponse(AdminProfile adminProfile) {
        return AdminResponse.builder()
                .id(adminProfile.getId())
                .userId(adminProfile.getUser().getId())
                .department(adminProfile.getDepartment())
                .designation(adminProfile.getDesignation())
                .active(adminProfile.getActive())
                .createdAt(adminProfile.getCreatedAt())
                .updatedAt(adminProfile.getUpdatedAt())
                .build();
    }
}
