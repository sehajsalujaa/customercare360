package com.cts.dto;

import lombok.Data;

@Data
public class OtpVerificationRequestDto {
    private String emailOrPhone;
    private String otp;
}
