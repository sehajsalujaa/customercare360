package com.cts.serviceimpl;

import com.cts.dto.*;
import com.cts.entity.Complaint;
import com.cts.entity.Customer;
import com.cts.entity.ServiceAccount;
import com.cts.entity.ServiceRequest;
import com.cts.enums.CustomerStatus;
import com.cts.enums.RequestStatus;
import com.cts.repository.ComplaintRepository;
import com.cts.repository.CustomerRepository;
import com.cts.repository.ServiceAccountRepository;
import com.cts.repository.ServiceRequestRepository;
import com.cts.service.AgentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentDashboardServiceImpl implements AgentDashboardService {

    private final CustomerRepository customerRepository;
    private final ComplaintRepository complaintRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceAccountRepository serviceAccountRepository;

    @Override
    public AgentDashboardStatsDto getDashboardStats() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime now = LocalDateTime.now();

        long totalCustomers = customerRepository.count();
        long pendingApprovals = customerRepository.countByCustomerStatus(CustomerStatus.PENDING);
        long complaintsMonth = complaintRepository.countByCreatedAtBetween(startOfMonth, now);
        long openRequests = serviceRequestRepository.countByStatus(RequestStatus.OPEN);

        return AgentDashboardStatsDto.builder()
                .totalCustomers(totalCustomers)
                .pendingApprovals(pendingApprovals)
                .complaintsMonth(complaintsMonth)
                .openRequests(openRequests)
                .build();
    }

    @Override
    public List<AgentComplaintDto> getRecentComplaints(int limit) {
        Pageable pageable = PageRequest.of(0, Math.max(1, limit));
        return complaintRepository.findAllByOrderByCreatedAtDesc(pageable).stream()
                .map(this::mapComplaint)
                .toList();
    }

    @Override
    public List<AgentRecentActivityDto> getRecentActivities(int limit) {
        int safeLimit = Math.max(1, limit);
        Pageable pageable = PageRequest.of(0, safeLimit);

        List<AgentRecentActivityDto> activities = new ArrayList<>();

        List<Customer> recentCustomers = customerRepository.findAllByOrderByCreatedAtDesc(pageable);
        activities.addAll(recentCustomers.stream().map(c -> AgentRecentActivityDto.builder()
                .id("CUST-" + c.getCustomerId())
                .activityType("CUSTOMER")
                .title("Customer profile created")
                .description(c.getName() + " (" + (c.getCustomerType() != null ? c.getCustomerType().name() : "NA") + ")")
                .createdAt(c.getCreatedAt())
                .build()).toList());

        List<ServiceRequest> recentRequests = serviceRequestRepository.findAllByOrderByCreatedDateDesc(pageable);
        activities.addAll(recentRequests.stream().map(r -> AgentRecentActivityDto.builder()
                .id("REQ-" + r.getRequestId())
                .activityType("REQUEST")
                .title("Service request created")
                .description((r.getRequestType() != null ? r.getRequestType().name() : "REQUEST") + " for customer #" +
                        (r.getCustomer() != null ? r.getCustomer().getCustomerId() : "NA"))
                .createdAt(r.getCreatedDate())
                .build()).toList());

        List<Complaint> recentComplaints = complaintRepository.findAllByOrderByCreatedAtDesc(pageable);
        activities.addAll(recentComplaints.stream().map(c -> AgentRecentActivityDto.builder()
                .id("CMP-" + c.getComplaintId())
                .activityType("COMPLAINT")
                .title("Complaint logged")
                .description((c.getComplaintCategory() != null ? c.getComplaintCategory().name() : "GENERAL") + " complaint")
                .createdAt(c.getCreatedAt())
                .build()).toList());

        return activities.stream()
                .filter(a -> a.getCreatedAt() != null)
                .sorted(Comparator.comparing(AgentRecentActivityDto::getCreatedAt).reversed())
                .limit(safeLimit)
                .toList();
    }

    @Override
    public Page<AgentCustomerListDto> getCustomers(String search, Pageable pageable) {
        String q = search == null ? "" : search.trim();
        return customerRepository.searchCustomers(q, pageable)
                .map(c -> AgentCustomerListDto.builder()
                        .id(c.getCustomerId())
                        .name(c.getName())
                        .email(c.getUser() != null ? c.getUser().getEmail() : null)
                        .phone(c.getUser() != null ? c.getUser().getPhone() : null)
                        .status(c.getCustomerStatus() != null ? c.getCustomerStatus().name() : null)
                        .build());
    }

    @Override
    public List<AgentServiceAccountDto> getServiceAccounts(Long customerId) {
        List<ServiceAccount> accounts = customerId == null
                ? serviceAccountRepository.findAll()
                : serviceAccountRepository.findByCustomerCustomerId(customerId);

        return accounts.stream().map(a -> AgentServiceAccountDto.builder()
                .id(a.getAccountId())
                .customerId(a.getCustomer() != null ? a.getCustomer().getCustomerId() : null)
                .serviceType(a.getServiceType() != null ? a.getServiceType().name() : null)
                .status(a.getServiceAccountStatus() != null ? a.getServiceAccountStatus().name() : null)
                .build()).toList();
    }

    @Override
    public Page<AgentComplaintDto> getComplaints(Pageable pageable) {
        return complaintRepository.findAll(pageable).map(this::mapComplaint);
    }

    @Override
    public List<AgentRequestDto> getRequests(RequestStatus status) {
        List<ServiceRequest> requests = status == null
                ? serviceRequestRepository.findAll()
                : serviceRequestRepository.findByStatus(status);

        return requests.stream().map(r -> AgentRequestDto.builder()
                .requestId(r.getRequestId())
                .customerId(r.getCustomer() != null ? r.getCustomer().getCustomerId() : null)
                .requestType(r.getRequestType() != null ? r.getRequestType().name() : null)
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .priority(r.getPriority() != null ? r.getPriority().name() : null)
                .createdAt(r.getCreatedDate())
                .lastUpdated(r.getLastUpdated())
                .build()).toList();
    }

    private AgentComplaintDto mapComplaint(Complaint c) {
        return AgentComplaintDto.builder()
                .id(c.getComplaintId())
                .userId(c.getUser() != null ? c.getUser().getUserID() : null)
                .complaintCategory(c.getComplaintCategory() != null ? c.getComplaintCategory().name() : null)
                .complaintStatus(c.getComplaintStatus() != null ? c.getComplaintStatus().name() : null)
                .description(c.getDescription())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
