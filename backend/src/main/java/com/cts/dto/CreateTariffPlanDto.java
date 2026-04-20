package com.cts.dto;

import com.cts.enums.CustomerType;
import com.cts.enums.ServiceType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateTariffPlanDto {
    private ServiceType serviceType;
    private CustomerType customerType;
    private String region;
    private Double fixedCharge;
    private Double taxPercent;
    private Double dutyPercent;
    private Double subsidyAmount;
    private String lateFeeRule;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private List<TariffSlabDto> slabs;
}
