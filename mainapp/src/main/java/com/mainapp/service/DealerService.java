package com.mainapp.service;

import com.mainapp.dto.DealerApprovalRequest;
import com.mainapp.dto.DealerRegistrationRequest;
import com.mainapp.dto.DealerRequest;
import com.mainapp.dto.DealerResponse;
import com.mainapp.exception.ResourceAlreadyExistsException;
import com.mainapp.exception.ResourceNotFoundException;
import com.mainapp.model.Dealer;
import com.mainapp.model.DealerStatus;
import com.mainapp.model.User;
import com.mainapp.model.User.UserRole;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DealerService {

    private final DealerRepository dealerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ================== ADMIN CREATES DEALER (Direct Approval) ==================

    public DealerResponse createDealer(DealerRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Check if shop license already exists
        if (dealerRepository.existsByShopLicense(request.getShopLicense())) {
            throw new ResourceAlreadyExistsException("Shop license already exists: " + request.getShopLicense());
        }

        // Create User first
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                // .password(request.getPassword()) // TODO: Hash password
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(UserRole.DEALER)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create Dealer profile with ACTIVE status (Admin created, no approval needed)
        Dealer dealer = Dealer.builder()
                .user(savedUser)
                .shopName(request.getShopName())
                .shopLicense(request.getShopLicense())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .region(request.getRegion())
                .active(true)
                .status(DealerStatus.ACTIVE) // Direct ACTIVE status
                .build();

        Dealer savedDealer = dealerRepository.save(dealer);
        return mapToResponse(savedDealer);
    }

    // ================== DEALER SELF-REGISTRATION ==================

    public DealerResponse registerDealer(DealerRegistrationRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Check if shop license already exists
        if (dealerRepository.existsByShopLicense(request.getShopLicense())) {
            throw new ResourceAlreadyExistsException("Shop license already exists: " + request.getShopLicense());
        }

        // Create User first
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                // .password(request.getPassword()) // TODO: Hash password
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .aadhaarRef(request.getAadhaarRef())
                .phone(request.getPhoneNumber())
                .role(UserRole.DEALER)
                .active(false) // Not active until approved
                .build();

        User savedUser = userRepository.save(user);

        // Create Dealer profile with PENDING_APPROVAL status
        Dealer dealer = Dealer.builder()
                .user(savedUser)
                .shopName(request.getShopName())
                .shopLicense(request.getShopLicense())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .region(request.getRegion())
                .active(false)
                .status(DealerStatus.PENDING_APPROVAL) // Needs admin approval
                .build();

        Dealer savedDealer = dealerRepository.save(dealer);
        return mapToResponse(savedDealer);
    }

    // ================== ADMIN APPROVAL/REJECTION ==================

    public DealerResponse approveDealer(Long dealerId, Long adminUserId, DealerApprovalRequest request) {
        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + dealerId));

        if (dealer.getStatus() != DealerStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Dealer is not in PENDING_APPROVAL status. Current status: " + dealer.getStatus());
        }

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            // Approve dealer
            dealer.setStatus(DealerStatus.ACTIVE);
            dealer.setActive(true);
            dealer.setApprovedAt(LocalDateTime.now());
            dealer.setApprovedBy(adminUserId);
            dealer.setRejectionReason(null);

            // Activate user account
            dealer.getUser().setActive(true);

        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            // Reject dealer
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required when rejecting a dealer");
            }

            dealer.setStatus(DealerStatus.REJECTED);
            dealer.setActive(false);
            dealer.setRejectionReason(request.getRejectionReason());

            // Keep user account inactive
            dealer.getUser().setActive(false);

        } else {
            throw new IllegalArgumentException("Invalid action. Use APPROVE or REJECT");
        }

        Dealer updatedDealer = dealerRepository.save(dealer);
        return mapToResponse(updatedDealer);
    }

    // ================== GET PENDING DEALERS ==================

    @Transactional(readOnly = true)
    public List<DealerResponse> getPendingDealers() {
        return dealerRepository.findByStatus(DealerStatus.PENDING_APPROVAL).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================== GET DEALERS BY STATUS ==================

    @Transactional(readOnly = true)
    public List<DealerResponse> getDealersByStatus(String status) {
        DealerStatus dealerStatus;
        try {
            dealerStatus = DealerStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        return dealerRepository.findByStatus(dealerStatus).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================== EXISTING METHODS ==================


    @Transactional(readOnly = true)
    public DealerResponse getDealerById(Long id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));
        return mapToResponse(dealer);
    }

    @Transactional(readOnly = true)
    public DealerResponse getDealerByShopLicense(String shopLicense) {
        Dealer dealer = dealerRepository.findByShopLicense(shopLicense)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with shop license: " + shopLicense));
        return mapToResponse(dealer);
    }

    @Transactional(readOnly = true)
    public DealerResponse getDealerByUserId(Long userId) {
        Dealer dealer = dealerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found for user id: " + userId));
        return mapToResponse(dealer);
    }

    @Transactional(readOnly = true)
    public List<DealerResponse> getAllDealers() {
        return dealerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DealerResponse> getDealersByRegion(String region) {
        return dealerRepository.findByRegion(region).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DealerResponse updateDealer(Long id, DealerRequest request) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));

        // Update user information
        User user = dealer.getUser();
        if (!user.getUsername().equals(request.getUsername()) &&
                userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
       if (request.getPassword() != null && !request.getPassword().isEmpty()) {
    user.setPassword(passwordEncoder.encode(request.getPassword()));
}

        // Update dealer profile
        if (!dealer.getShopLicense().equals(request.getShopLicense()) &&
                dealerRepository.existsByShopLicense(request.getShopLicense())) {
            throw new ResourceAlreadyExistsException("Shop license already exists: " + request.getShopLicense());
        }

        dealer.setShopName(request.getShopName());
        dealer.setShopLicense(request.getShopLicense());
        dealer.setAddress(request.getAddress());
        dealer.setPhoneNumber(request.getPhoneNumber());
        dealer.setRegion(request.getRegion());

        Dealer updatedDealer = dealerRepository.save(dealer);
        return mapToResponse(updatedDealer);
    }

    public DealerResponse deactivateDealer(Long id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));

        dealer.setActive(false);
        dealer.getUser().setActive(false);

        Dealer updatedDealer = dealerRepository.save(dealer);
        return mapToResponse(updatedDealer);
    }

    public DealerResponse activateDealer(Long id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));

        dealer.setActive(true);
        dealer.getUser().setActive(true);

        Dealer updatedDealer = dealerRepository.save(dealer);
        return mapToResponse(updatedDealer);
    }

    public void deleteDealer(Long id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + id));

        // Delete dealer profile first, then user
        User user = dealer.getUser();
        dealerRepository.delete(dealer);
        userRepository.delete(user);
    }

    // Helper method to map Dealer to DealerResponse
    private DealerResponse mapToResponse(Dealer dealer) {
        return DealerResponse.builder()
                .id(dealer.getId())
                .userId(dealer.getUser().getId())
                .username(dealer.getUser().getUsername())
                .email(dealer.getUser().getEmail())
                .fullName(dealer.getUser().getFullName())
                .shopName(dealer.getShopName())
                .shopLicense(dealer.getShopLicense())
                .address(dealer.getAddress())
                .phoneNumber(dealer.getPhoneNumber())
                .region(dealer.getRegion())
                .active(dealer.getActive())
                .status(dealer.getStatus().name())
                .rejectionReason(dealer.getRejectionReason())
                .approvedAt(dealer.getApprovedAt())
                .approvedBy(dealer.getApprovedBy())
                .createdAt(dealer.getCreatedAt())
                .updatedAt(dealer.getUpdatedAt())
                .build();
    }
}
