package com.cts.dto;

import lombok.Data;

@Data
public class LoginRequestDto {
    private String email;
    private String phone;
    private String password;
}
