package com.mainapp.service;

import com.mainapp.dto.GrievanceRequest;
import com.mainapp.dto.GrievanceResponse;
import com.mainapp.dto.GrievanceStatusRequest;
import com.mainapp.model.*;
import com.mainapp.repository.CitizenRepository;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.GrievanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final CitizenRepository citizenRepository;
    private final DealerRepository dealerRepository;

    @Transactional
    public GrievanceResponse createGrievance(GrievanceRequest request) {
        Citizen citizen = citizenRepository.findById(request.getCitizenId())
                .orElseThrow(() -> new RuntimeException("Citizen not found with ID: " + request.getCitizenId()));

        Dealer assignedDealer = citizen.getAssignedDealer();
        if (assignedDealer == null) {
            throw new RuntimeException("Citizen is not assigned to any dealer. Grievance cannot be routed.");
        }

        Long dealerId = request.getDealerId() != null ? request.getDealerId() : assignedDealer.getId();
        if (!assignedDealer.getId().equals(dealerId)) {
            throw new RuntimeException("Grievance can only be submitted against the citizen's assigned dealer");
        }

        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        Grievance grievance = Grievance.builder()
                .citizenId(citizen.getId())
                .dealerId(dealer.getId())
                .subject(request.getSubject().trim())
                .category(request.getCategory().trim())
                .description(request.getDescription().trim())
                .priority(request.getPriority() != null ? request.getPriority() : GrievancePriority.MEDIUM)
                .status(GrievanceStatus.OPEN)
                .build();

        return mapToResponse(grievanceRepository.save(grievance), citizen, dealer);
    }

    public List<GrievanceResponse> getAllGrievances(GrievanceStatus status) {
        List<Grievance> grievances = status == null
                ? grievanceRepository.findAllByOrderByCreatedAtDesc()
                : grievanceRepository.findByStatusOrderByCreatedAtDesc(status);

        return grievances.stream().map(this::mapToResponse).toList();
    }

    public List<GrievanceResponse> getGrievancesByDealer(Long dealerId) {
        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));

        return grievanceRepository.findByDealerIdOrderByCreatedAtDesc(dealerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<GrievanceResponse> getGrievancesByCitizen(Long citizenId) {
        citizenRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found with ID: " + citizenId));

        return grievanceRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public GrievanceResponse updateStatus(Long id, GrievanceStatusRequest request) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found with ID: " + id));

        grievance.setStatus(request.getStatus());
        grievance.setResponse(normalizeResponse(request.getResponse()));

        if (request.getStatus() == GrievanceStatus.RESOLVED || request.getStatus() == GrievanceStatus.REJECTED) {
            grievance.setResolvedAt(LocalDateTime.now());
        } else {
            grievance.setResolvedAt(null);
        }

        return mapToResponse(grievanceRepository.save(grievance));
    }

    private String normalizeResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return null;
        }
        return response.trim();
    }

    private GrievanceResponse mapToResponse(Grievance grievance) {
        Citizen citizen = citizenRepository.findById(grievance.getCitizenId()).orElse(null);
        Dealer dealer = dealerRepository.findById(grievance.getDealerId()).orElse(null);
        return mapToResponse(grievance, citizen, dealer);
    }

    private GrievanceResponse mapToResponse(Grievance grievance, Citizen citizen, Dealer dealer) {
        return GrievanceResponse.builder()
                .id(grievance.getId())
                .citizenId(grievance.getCitizenId())
                .citizenName(citizen != null && citizen.getUser() != null ? citizen.getUser().getFullName() : "Unknown")
                .rationCardNumber(citizen != null ? citizen.getRationCardNumber() : "Unknown")
                .dealerId(grievance.getDealerId())
                .dealerName(dealer != null ? dealer.getShopName() : "Unknown")
                .subject(grievance.getSubject())
                .category(grievance.getCategory())
                .description(grievance.getDescription())
                .priority(grievance.getPriority().name())
                .status(grievance.getStatus().name())
                .response(grievance.getResponse())
                .createdAt(grievance.getCreatedAt())
                .updatedAt(grievance.getUpdatedAt())
                .resolvedAt(grievance.getResolvedAt())
                .build();
    }
}
