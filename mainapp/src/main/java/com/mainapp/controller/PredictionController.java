package com.mainapp.controller;

import com.mainapp.dto.ApiResponse;
import com.mainapp.dto.PredictionRequest;
import com.mainapp.dto.PredictionResponse;
import com.mainapp.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<PredictionResponse>> generatePrediction(
            @Valid @RequestBody PredictionRequest request) {
        try {
            PredictionResponse response = predictionService.generatePrediction(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Prediction generated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/generate-for-dealer")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> generatePredictionsForDealer(
            @RequestParam Long dealerId,
            @RequestParam String predictionMonth) {
        try {
            List<PredictionResponse> response = predictionService.generatePredictionsForDealer(dealerId, predictionMonth);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Predictions generated successfully for all products", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/generate-future-for-dealer")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> generateFuturePredictionsForDealer(
            @RequestParam Long dealerId,
            @RequestParam(defaultValue = "6") int months) {
        try {
            List<PredictionResponse> response = predictionService.generateFuturePredictionsForDealer(dealerId, months);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Future predictions generated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PredictionResponse>> getPredictionById(@PathVariable Long id) {
        try {
            PredictionResponse response = predictionService.getPredictionById(id);
            return ResponseEntity.ok(ApiResponse.success("Prediction retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getPredictionsByDealer(@PathVariable Long dealerId) {
        try {
            List<PredictionResponse> response = predictionService.getPredictionsByDealer(dealerId);
            return ResponseEntity.ok(ApiResponse.success("Predictions retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/month/{predictionMonth}")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getPredictionsByMonth(
            @PathVariable String predictionMonth) {
        List<PredictionResponse> response = predictionService.getPredictionsByMonth(predictionMonth);
        return ResponseEntity.ok(ApiResponse.success("Predictions retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getAllPredictions() {
        List<PredictionResponse> response = predictionService.getAllPredictions();
        return ResponseEntity.ok(ApiResponse.success("All predictions retrieved successfully", response));
    }
}
