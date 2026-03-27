package com.cts.dto;

import com.cts.enums.ServiceType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBillingCycleDto {
    private ServiceType serviceType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate billDate;
}
