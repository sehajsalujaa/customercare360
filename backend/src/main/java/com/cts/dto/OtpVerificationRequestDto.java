package com.cts.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerificationRequestDto {

    @NotBlank(message = "Email or Phone cannot be blank")
    private String emailOrPhone;

    @NotBlank(message = "OTP cannot be blank")
    private String otp;
}
