package com.cts.controller;

import com.cts.dto.*;
import com.cts.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequestDto request) {
        authService.registerCustomer(request);
        return ResponseEntity.ok("OTP sent successfully");
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody OtpVerificationRequestDto request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok("Account activated successfully");
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request){
        return ResponseEntity.ok(authService.login(request));
    }
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(authService.refreshToken(request.get("refreshToken")));
    }
    @PostMapping("/logout-all")
    public ResponseEntity<String> logoutAll(
            @RequestParam String emailOrPhone) {
        authService.logoutAll(emailOrPhone);
        return ResponseEntity.ok("Logged out from all devices");
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto request) {
        authService.initiatePasswordReset(request.getEmailOrPhone());
        return ResponseEntity.ok("Password reset OTP sent");
    }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password updated successfully");
    }
}
