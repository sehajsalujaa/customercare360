package com.cts.dto;

import lombok.Data;

@Data
public class KpiThresholdDto {
    private double slaThreshold;
    private double adjustmentThreshold;
    private int complaintThreshold;
}
