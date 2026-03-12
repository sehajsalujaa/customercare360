package com.cts.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequestDto {

    @NotBlank(message = "Email or Phone cannot be blank")
    private String emailOrPhone;
}
