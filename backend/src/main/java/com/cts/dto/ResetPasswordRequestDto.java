package com.cts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequestDto {

    @NotBlank(message = "Email or Phone cannot be blank")
    private String emailOrPhone;

    @NotBlank(message = "OTP cannot be blank")
    private String otpCode;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;
}
