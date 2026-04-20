package com.cts.controller;

import com.cts.dto.*;
import com.cts.entity.Customer;
import com.cts.entity.ServiceRequest;
import com.cts.enums.ComplaintCategory;
import com.cts.enums.ComplaintStatus;
import com.cts.repository.BillRepository;
import com.cts.repository.ComplaintRepository;
import com.cts.repository.CustomerRepository;
import com.cts.repository.ServiceRequestRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.BillService;
import com.cts.service.CustomerService;
import com.cts.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    private final RequestService requestService;
    private final SecurityUtil securityUtil;
    private final CustomerRepository customerRepository;
    private final BillRepository billRepository;
    private final BillService billService;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ComplaintRepository complaintRepository;

    @PostMapping("/service-request")
    public ResponseEntity<String> raiseServiceRequest(
            @RequestBody CreateServiceRequestDto dto) {
        customerService.createServiceRequest(dto);
        return ResponseEntity.ok("Service request created successfully");
    }

    @GetMapping("/request-status/{requestId}")
    public ResponseEntity<RequestStatusResponseDto> getRequestStatus(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(requestService.getRequestStatus(requestId));
    }

    /** Returns the Customer record for the currently logged-in customer user. */
    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<CustomerProfileResponseDto> getMyProfile() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            Customer customer = customerRepository.findAll().stream()
                    .filter(c -> c.getUser() != null && c.getUser().getUserID().equals(userId))
                    .findFirst()
                    .orElse(null);
            if (customer == null) return ResponseEntity.ok(null);
            return ResponseEntity.ok(
                    customerService.getCustomerProfile(customer.getCustomerId(), PageRequest.of(0, 100))
            );
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    /** Returns all bills for the currently logged-in customer. */
    @GetMapping("/my-bills")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BillResponseDto>> getMyBills() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            Customer customer = customerRepository.findAll().stream()
                    .filter(c -> c.getUser() != null && c.getUser().getUserID().equals(userId))
                    .findFirst().orElse(null);
            if (customer == null) return ResponseEntity.ok(Collections.emptyList());
            return ResponseEntity.ok(billService.getBillsForCustomer(customer.getCustomerId()));
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /** Returns all service requests for the currently logged-in customer. */
    @GetMapping("/my-requests")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AgentRequestDto>> getMyRequests() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            Customer customer = customerRepository.findAll().stream()
                    .filter(c -> c.getUser() != null && c.getUser().getUserID().equals(userId))
                    .findFirst().orElse(null);
            if (customer == null) return ResponseEntity.ok(Collections.emptyList());
            List<ServiceRequest> requests = serviceRequestRepository
                    .findByCustomerCustomerId(customer.getCustomerId(), PageRequest.of(0, 100))
                    .getContent();
            List<AgentRequestDto> dtos = requests.stream().map(r -> AgentRequestDto.builder()
                    .requestId(r.getRequestId())
                    .customerId(customer.getCustomerId())
                    .requestType(r.getRequestType() != null ? r.getRequestType().name() : null)
                    .status(r.getStatus() != null ? r.getStatus().name() : null)
                    .priority(r.getPriority() != null ? r.getPriority().name() : null)
                    .createdAt(r.getCreatedDate())
                    .lastUpdated(r.getLastUpdated())
                    .build()).toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /** Returns all complaints raised by the currently logged-in user. */
    @GetMapping("/my-complaints")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ComplaintResponseDto>> getMyComplaints() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            return ResponseEntity.ok(
                    complaintRepository.findByUserUserID(userId).stream().map(c -> ComplaintResponseDto.builder()
                            .complaintId(c.getComplaintId())
                            .userId(c.getUser() != null ? c.getUser().getUserID() : null)
                            .userName(c.getUser() != null ? c.getUser().getUsername() : null)
                            .userEmail(c.getUser() != null ? c.getUser().getEmail() : null)
                            .complaintCategory(c.getComplaintCategory())
                            .description(c.getDescription())
                            .complaintStatus(c.getComplaintStatus())
                            .createdAt(c.getCreatedAt())
                            .resolutionNotes(c.getResolutionNotes())
                            .resolvedAt(c.getResolvedAt())
                            .build()).toList()
            );
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /** Returns all disputes raised against the currently logged-in customer's bills. */
    @GetMapping("/my-disputes")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BillingDisputeResponseDto>> getMyDisputes() {
        try {
            Long userId = securityUtil.getCurrentUserId();
            Customer customer = customerRepository.findAll().stream()
                    .filter(c -> c.getUser() != null && c.getUser().getUserID().equals(userId))
                    .findFirst().orElse(null);
            if (customer == null) return ResponseEntity.ok(Collections.emptyList());
            // Reuse getDisputes from billService — filtered by customer via bill ownership
            return ResponseEntity.ok(billService.getDisputes(null).stream()
                    .filter(d -> customer.getName().equals(d.getCustomerName())
                            || (customer.getUser() != null && customer.getUser().getEmail().equals(d.getCustomerEmail())))
                    .toList());
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}

