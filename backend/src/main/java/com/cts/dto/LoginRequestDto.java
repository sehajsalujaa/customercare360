package com.cts.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDto {

    @NotBlank(message = "Email or Phone cannot be blank")
    private String email;
    private String phone;
    @NotBlank(message = "Password cannot be blank")
    private String password;
}
