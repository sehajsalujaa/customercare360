package com.cts.dto;

import lombok.Data;

@Data
public class ResetPasswordRequestDto {
    private String emailOrPhone;
    private String otpCode;
    private String newPassword;
}
