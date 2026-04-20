package com.cts.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardResponseDto {
    // Billing
    private long totalBills;
    private long adjustedBills;
    private double accuracyRate;  // 0.0 - 1.0

    // Customers
    private long totalCustomers;
    private long activeCustomers;
    private long pendingCustomers;

    // Complaints
    private long totalComplaints;
    private long openComplaints;
    private long resolvedComplaints;

    // Trends (month -> count, e.g. "2026-03" -> 5)
    private Map<String, Long> billingTrend;
    private Map<String, Long> complaintTrend;

    // Legacy field (kept for compatibility)
    private Map<String, Long> adjustmentsTrend;
}
