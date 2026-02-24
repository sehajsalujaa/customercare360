package com.cts.controller;

import com.cts.dto.*;
import com.cts.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequestDto request) {
        authService.registerCustomer(request);
        return "OTP sent successfully";
    }
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody OtpVerificationRequestDto request) {
        authService.verifyOtp(request);
        return "Account activated successfully";
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto request){
        return ResponseEntity.ok(authService.login(request));
    }
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(authService.refreshToken(request.get("refreshToken")));
    }
    @PostMapping("/logout-all")
    public ResponseEntity<String> logoutAll(
            @RequestParam String emailOrPhone) {
        authService.logoutAll(emailOrPhone);
        return ResponseEntity.ok("Logged out from all devices");
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDto request) {
        authService.initiatePasswordReset(request.getEmailOrPhone());
        return ResponseEntity.ok("Password reset OTP sent");
    }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password updated successfully");
    }
}
