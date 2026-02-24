package com.cts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequestDto {

    @NotBlank
    private String username;

    @Email
    private String email;

    private String phone;

    @NotBlank
    private String password;
}
