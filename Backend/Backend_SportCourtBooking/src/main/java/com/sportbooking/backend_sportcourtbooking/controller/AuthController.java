package com.sportbooking.backend_sportcourtbooking.controller;


import com.sportbooking.backend_sportcourtbooking.DTOs.LoginRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.RegisterRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.UserResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.VerifyOtpRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestRegisterOtp(@Valid @RequestBody RegisterRequest request){
        authService.requestRegistrationOtp(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", Map.of("message", "Đã gửi OTP đến email của bạn")));
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<ApiResponse<UserResponse>> verifyRegisterOtp(@Valid @RequestBody VerifyOtpRequest request){
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", authService.verifyRegistrationOtp(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", authService.login(request)));
    }

    @PostMapping("/walk-in")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<ApiResponse<UserResponse>> createWalkInGuest(
            @RequestParam String fullName,
            @RequestParam String phone
    ){
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", authService.createWalkInGuest(fullName, phone)));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> requestRegisterOtpOld(@Valid @RequestBody RegisterRequest request){
        authService.requestRegistrationOtp(request);
        return ResponseEntity.ok(Map.of("message", "Đã gửi OTP đến email của bạn"));
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<UserResponse> verifyRegisterOtpOld(@Valid @RequestBody VerifyOtpRequest request){
        return ResponseEntity.ok(authService.verifyRegistrationOtp(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> loginOld(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/walk-in")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<UserResponse> createWalkInGuestOld(
            @RequestParam String fullName,
            @RequestParam String phone
    ){
        return ResponseEntity.ok(authService.createWalkInGuest(fullName, phone));
    }
    */
}
