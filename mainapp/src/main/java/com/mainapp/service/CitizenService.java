package com.mainapp.service;

import com.mainapp.dto.CitizenRequest;
import com.mainapp.dto.CitizenResponse;
import com.mainapp.exception.ResourceAlreadyExistsException;
import com.mainapp.exception.ResourceNotFoundException;
import com.mainapp.model.Citizen;
import com.mainapp.model.Dealer;
import com.mainapp.model.User;
import com.mainapp.model.User.UserRole;
import com.mainapp.repository.CitizenRepository;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final UserRepository userRepository;
    private final DealerRepository dealerRepository;
    private final PasswordEncoder passwordEncoder;

    public CitizenResponse createCitizen(CitizenRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Check if ration card already exists
        if (citizenRepository.existsByRationCardNumber(request.getRationCardNumber())) {
            throw new ResourceAlreadyExistsException("Ration card number already exists: " + request.getRationCardNumber());
        }

        // Create User first
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                // .password(request.getPassword()) // TODO: Hash password
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(UserRole.CITIZEN)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Get dealer if provided
        Dealer dealer = null;
        if (request.getDealerId() != null) {
            dealer = dealerRepository.findById(request.getDealerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + request.getDealerId()));
        }

        // Create Citizen profile
        Citizen citizen = Citizen.builder()
                .user(savedUser)
                .rationCardNumber(request.getRationCardNumber())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .familySize(request.getFamilySize())
                .category(request.getCategory())
                .assignedDealer(dealer)
                .build();

        Citizen savedCitizen = citizenRepository.save(citizen);
        return mapToResponse(savedCitizen);
    }

    @Transactional(readOnly = true)
    public CitizenResponse getCitizenById(Long id) {
        Citizen citizen = citizenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + id));
        return mapToResponse(citizen);
    }

    @Transactional(readOnly = true)
    public CitizenResponse getCitizenByRationCardNumber(String rationCardNumber) {
        Citizen citizen = citizenRepository.findByRationCardNumber(rationCardNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with ration card number: " + rationCardNumber));
        return mapToResponse(citizen);
    }

    @Transactional(readOnly = true)
    public CitizenResponse getCitizenByUserId(Long userId) {
        Citizen citizen = citizenRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found for user id: " + userId));
        return mapToResponse(citizen);
    }

    @Transactional(readOnly = true)
    public List<CitizenResponse> getAllCitizens() {
        return citizenRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CitizenResponse> getCitizensByDealerId(Long dealerId) {
        return citizenRepository.findByAssignedDealerId(dealerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CitizenResponse> getCitizensByCategory(Citizen.CitizenCategory category) {
        return citizenRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CitizenResponse updateCitizen(Long id, CitizenRequest request) {
        Citizen citizen = citizenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + id));

        // Update user information
        User user = citizen.getUser();
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
            user.setPassword(request.getPassword()); // TODO: Hash password
        }

        // Update citizen profile
        if (!citizen.getRationCardNumber().equals(request.getRationCardNumber()) &&
                citizenRepository.existsByRationCardNumber(request.getRationCardNumber())) {
            throw new ResourceAlreadyExistsException("Ration card number already exists: " + request.getRationCardNumber());
        }

        citizen.setRationCardNumber(request.getRationCardNumber());
        citizen.setAddress(request.getAddress());
        citizen.setPhoneNumber(request.getPhoneNumber());
        citizen.setFamilySize(request.getFamilySize());
        citizen.setCategory(request.getCategory());

        // Update dealer if provided
        if (request.getDealerId() != null) {
            Dealer dealer = dealerRepository.findById(request.getDealerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + request.getDealerId()));
            citizen.setAssignedDealer(dealer);
        }

        Citizen updatedCitizen = citizenRepository.save(citizen);
        return mapToResponse(updatedCitizen);
    }

    public CitizenResponse assignDealer(Long citizenId, Long dealerId) {
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));

        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + dealerId));

        citizen.setAssignedDealer(dealer);
        Citizen updatedCitizen = citizenRepository.save(citizen);
        return mapToResponse(updatedCitizen);
    }

    public void deleteCitizen(Long id) {
        Citizen citizen = citizenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + id));

        // Delete citizen profile first, then user
        User user = citizen.getUser();
        citizenRepository.delete(citizen);
        userRepository.delete(user);
    }

    // Helper method to map Citizen to CitizenResponse
    private CitizenResponse mapToResponse(Citizen citizen) {
        return CitizenResponse.builder()
                .id(citizen.getId())
                .userId(citizen.getUser().getId())
                .username(citizen.getUser().getUsername())
                .email(citizen.getUser().getEmail())
                .fullName(citizen.getUser().getFullName())
                .rationCardNumber(citizen.getRationCardNumber())
                .address(citizen.getAddress())
                .phoneNumber(citizen.getPhoneNumber())
                .familySize(citizen.getFamilySize())
                .category(citizen.getCategory())
                .dealerId(citizen.getAssignedDealer() != null ? citizen.getAssignedDealer().getId() : null)
                .dealerShopName(citizen.getAssignedDealer() != null ? citizen.getAssignedDealer().getShopName() : null)
                .createdAt(citizen.getCreatedAt())
                .updatedAt(citizen.getUpdatedAt())
                .build();
    }
}
