package com.cts.service;

import com.cts.dto.*;
import com.cts.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AgentDashboardService {
    AgentDashboardStatsDto getDashboardStats();
    List<AgentComplaintDto> getRecentComplaints(int limit);
    List<AgentRecentActivityDto> getRecentActivities(int limit);
    Page<AgentCustomerListDto> getCustomers(String search, Pageable pageable);
    List<AgentServiceAccountDto> getServiceAccounts(Long customerId);
    Page<AgentComplaintDto> getComplaints(Pageable pageable);
    List<AgentRequestDto> getRequests(RequestStatus status);
}
