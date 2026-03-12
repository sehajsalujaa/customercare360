package com.cts.dto;

import com.cts.enums.CustomerType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateCustomerDto {

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotBlank(message = "Email cannot be blank")
    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "Invalid email format"
    )
    private String email;

    @NotBlank(message = "Phone cannot be blank")
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Phone must be exactly 10 digits"
    )
    private String phone;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotNull(message = "Address is required")
    private String address;

    @NotBlank(message = "Country code is required")
    private String countryCode;

    @NotBlank(message = "Region code is required")
    private String regionCode;

    private CustomerType customerType;
}