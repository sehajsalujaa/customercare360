package com.cts.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class BillingCycleResponseDto {
    private Long cycleId;
    private String serviceType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate billDate;
    private String status;
}
