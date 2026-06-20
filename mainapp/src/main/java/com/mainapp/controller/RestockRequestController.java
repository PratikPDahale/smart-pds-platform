package com.mainapp.controller;

import com.mainapp.dto.ApiResponse;
import com.mainapp.dto.RestockDecisionRequest;
import com.mainapp.dto.RestockRequestCreateRequest;
import com.mainapp.dto.RestockRequestResponse;
import com.mainapp.model.RestockRequestStatus;
import com.mainapp.service.RestockRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restock-requests")
@RequiredArgsConstructor
public class RestockRequestController {

    private final RestockRequestService restockRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<RestockRequestResponse>> createRequest(
            @Valid @RequestBody RestockRequestCreateRequest request) {
        try {
            RestockRequestResponse response = restockRequestService.createRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Restock request submitted successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RestockRequestResponse>>> getRequests(
            @RequestParam(required = false) RestockRequestStatus status) {
        List<RestockRequestResponse> response = status == null
                ? restockRequestService.getAllRequests()
                : restockRequestService.getRequestsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Restock requests retrieved successfully", response));
    }

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<ApiResponse<List<RestockRequestResponse>>> getRequestsByDealer(@PathVariable Long dealerId) {
        try {
            List<RestockRequestResponse> response = restockRequestService.getRequestsByDealer(dealerId);
            return ResponseEntity.ok(ApiResponse.success("Dealer restock requests retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<RestockRequestResponse>> approveRequest(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) RestockDecisionRequest request) {
        try {
            RestockRequestResponse response = restockRequestService.approveRequest(id, request);
            return ResponseEntity.ok(ApiResponse.success("Restock request approved and stock added", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<RestockRequestResponse>> rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) RestockDecisionRequest request) {
        try {
            RestockRequestResponse response = restockRequestService.rejectRequest(id, request);
            return ResponseEntity.ok(ApiResponse.success("Restock request rejected", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
