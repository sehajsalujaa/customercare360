package com.cts.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequestDto {
    private String emailOrPhone;
}
