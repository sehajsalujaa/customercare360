package com.cts.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardResponseDto {
    private Map<String, Long> adjustmentsTrend;

    private double accuracyRate;
    private long totalBills;
    private long adjustedBills;
}
