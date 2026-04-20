package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentDashboardStatsDto {
    private long totalCustomers;
    private long pendingApprovals;
    private long complaintsMonth;
    private long openRequests;
}
