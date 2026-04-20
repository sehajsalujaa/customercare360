package com.cts.controller;

import com.cts.dto.*;
import com.cts.enums.RequestStatus;
import com.cts.service.AgentDashboardService;
import com.cts.service.CustomerService;
import com.cts.service.RequestService;
import com.cts.service.UserService;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentCustomerController {
    private final UserService userService;
    private final CustomerService customerService;
    private final RequestService requestService;
    private final AgentDashboardService agentDashboardService;

    @PostMapping("/create-customer")
    public ResponseEntity<String> createCustomerProfile(
            @Valid
            @RequestBody CreateCustomerDto dto) {
        userService.createCustomerByAgent(dto);
        return ResponseEntity.ok("Customer profile created and pending approval");
    }

    @PutMapping("/customers/{customerId}/contact")
    public ResponseEntity<String> updateCustomerContact(
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateCustomerContactDto dto
    ) {
        customerService.updateCustomerContact(customerId, dto);
        return ResponseEntity.ok("Customer contact updated successfully");
    }

    @PostMapping("/service-accounts")
    public ResponseEntity<String> createServiceAccount(
            @RequestBody CreateServiceAccountDto dto
    ){
        customerService.createServiceAccount(dto);
        return ResponseEntity.ok("Service account created successfully");
    }

    @PostMapping("/link-premise")
    public ResponseEntity<String> linkPremise(
            @RequestBody LinkPremiseDto dto){
        customerService.linkPremise(dto);
        return ResponseEntity.ok("Premise linked successfully");
    }

    @GetMapping("/customers/{customerId}/profile")
    public ResponseEntity<CustomerProfileResponseDto> getCustomerProfile(
            @PathVariable Long customerId, Pageable pageable) {
        return ResponseEntity.ok(customerService.getCustomerProfile(customerId, pageable));
    }

    @PostMapping("/service-agreement")
    public ResponseEntity<String> recordAgreement(
            @RequestBody RecordServiceAgreementDto dto){
        customerService.recordServiceAgreement(dto);
        return ResponseEntity.ok("Service agreement recorded successfully");
    }

    @PutMapping("/request/priority")
    public ResponseEntity<String> updateRequestPriority(
            @RequestBody UpdateRequestPriorityDto dto){
        requestService.updateRequestPriority(dto);
        return ResponseEntity.ok("Request priority updated");
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AgentDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(agentDashboardService.getDashboardStats());
    }

    @GetMapping("/dashboard/recent-complaints")
    public ResponseEntity<List<AgentComplaintDto>> getRecentComplaints(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(agentDashboardService.getRecentComplaints(limit));
    }

    @GetMapping("/dashboard/recent-activities")
    public ResponseEntity<List<AgentRecentActivityDto>> getRecentActivities(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(agentDashboardService.getRecentActivities(limit));
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<AgentCustomerListDto>> getCustomers(
            @RequestParam(defaultValue = "") String search,
            Pageable pageable) {
        return ResponseEntity.ok(agentDashboardService.getCustomers(search, pageable));
    }

    @GetMapping("/service-accounts")
    public ResponseEntity<List<AgentServiceAccountDto>> getServiceAccounts(
            @RequestParam(required = false) Long customerId) {
        return ResponseEntity.ok(agentDashboardService.getServiceAccounts(customerId));
    }

    @GetMapping("/complaints")
    public ResponseEntity<Page<AgentComplaintDto>> getComplaints(Pageable pageable) {
        return ResponseEntity.ok(agentDashboardService.getComplaints(pageable));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AgentRequestDto>> getRequests(
            @RequestParam(required = false) RequestStatus status) {
        return ResponseEntity.ok(agentDashboardService.getRequests(status));
    }
}
