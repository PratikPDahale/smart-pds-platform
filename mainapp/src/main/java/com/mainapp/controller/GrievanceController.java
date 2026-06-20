package com.mainapp.controller;

import com.mainapp.dto.ApiResponse;
import com.mainapp.dto.GrievanceRequest;
import com.mainapp.dto.GrievanceResponse;
import com.mainapp.dto.GrievanceStatusRequest;
import com.mainapp.model.GrievanceStatus;
import com.mainapp.service.GrievanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grievances")
@RequiredArgsConstructor
public class GrievanceController {

    private final GrievanceService grievanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<GrievanceResponse>> createGrievance(@Valid @RequestBody GrievanceRequest request) {
        GrievanceResponse response = grievanceService.createGrievance(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Grievance submitted successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getAllGrievances(
            @RequestParam(required = false) GrievanceStatus status) {
        List<GrievanceResponse> response = grievanceService.getAllGrievances(status);
        return ResponseEntity.ok(ApiResponse.success("Grievances retrieved successfully", response));
    }

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getDealerGrievances(@PathVariable Long dealerId) {
        List<GrievanceResponse> response = grievanceService.getGrievancesByDealer(dealerId);
        return ResponseEntity.ok(ApiResponse.success("Dealer grievances retrieved successfully", response));
    }

    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getCitizenGrievances(@PathVariable Long citizenId) {
        List<GrievanceResponse> response = grievanceService.getGrievancesByCitizen(citizenId);
        return ResponseEntity.ok(ApiResponse.success("Citizen grievances retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<GrievanceResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody GrievanceStatusRequest request) {
        GrievanceResponse response = grievanceService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Grievance status updated successfully", response));
    }
}
