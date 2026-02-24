package com.cts.service;

import com.cts.dto.*;

public interface AuthService {
    void registerCustomer(RegisterRequestDto request);
    void verifyOtp(OtpVerificationRequestDto request);
    LoginResponseDto login(LoginRequestDto request);
    LoginResponseDto refreshToken(String refreshToken);
    void logoutAll(String emailOrPhone);
    void initiatePasswordReset(String emailOrPhone);
    void resetPassword(ResetPasswordRequestDto request);
}
