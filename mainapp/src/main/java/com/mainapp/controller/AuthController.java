package com.mainapp.controller;

import com.mainapp.dto.AdminRegistrationRequest;
import com.mainapp.dto.AdminResponse;
import com.mainapp.dto.ApiResponse;
import com.mainapp.dto.LoginRequest;
import com.mainapp.dto.LoginResponse;
import com.mainapp.service.AdminService;
import com.mainapp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/admin/register")
    public ResponseEntity<ApiResponse<AdminResponse>> registerAdmin(@Valid @RequestBody AdminRegistrationRequest request) {
        AdminResponse response = adminService.registerAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin registered successfully", response));
    }
}
