package com.cts.dto;

import com.cts.enums.ServiceType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateServiceAccountDto {
    private Long customerId;
    private ServiceType serviceType;
    private LocalDate startDate;
}
