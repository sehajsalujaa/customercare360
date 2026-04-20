package com.cts.controller;

import com.cts.dto.AgentRequestDto;
import com.cts.dto.AssignServiceOrderDto;
import com.cts.dto.CreateServiceOrderDto;
import com.cts.dto.MeterReadingUpsertDto;
import com.cts.dto.ServiceOrderResponseDto;
import com.cts.dto.UpdateOrderStatusDto;
import com.cts.dto.ValidateMeterReadingDto;
import com.cts.entity.MeterReading;
import com.cts.entity.Premise;
import com.cts.entity.ServiceAccount;
import com.cts.entity.ServiceRequest;
import com.cts.entity.User;
import com.cts.enums.NotificationType;
import com.cts.enums.ReadingQualityFlag;
import com.cts.exception.CustomException;
import com.cts.repository.MeterReadingRepository;
import com.cts.repository.PremiseRepository;
import com.cts.repository.ServiceAccountRepository;
import com.cts.repository.ServiceRequestRepository;
import com.cts.repository.UserRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.AgentDashboardService;
import com.cts.service.NotificationService;
import com.cts.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/field")
@RequiredArgsConstructor
public class FieldCoordinatorController {
    private final OrderService orderService;
    private final ServiceRequestRepository serviceRequestRepository;
    private final PremiseRepository premiseRepository;
    private final ServiceAccountRepository serviceAccountRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SecurityUtil securityUtil;
    private final AgentDashboardService agentDashboardService;

    @PostMapping("/service-order")
    public ResponseEntity<String> createServiceOrder(
            @RequestBody CreateServiceOrderDto dto){
        orderService.createServiceOrder(dto);
        return ResponseEntity.ok("Service order created successfully");
    }

    @PutMapping("/assign-order")
    public ResponseEntity<String> assignServiceOrder(
            @RequestBody AssignServiceOrderDto dto){
        orderService.assignServiceOrder(dto);
        return ResponseEntity.ok("Technician assigned successfully");
    }

    @PutMapping("/complete-order")
    public ResponseEntity<String> completeOrder(
            @RequestBody UpdateOrderStatusDto dto){
        orderService.updateOrderStatus(dto);
        return ResponseEntity.ok("Order status updated successfully");
    }

    @GetMapping("/orders")
    public ResponseEntity<List<ServiceOrderResponseDto>> getOrders(
            @RequestParam(required = false) String status) {
        try {
            return ResponseEntity.ok(orderService.getAllOrders(status));
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/service-requests")
    public ResponseEntity<List<AgentRequestDto>> getServiceRequests() {
        try {
            List<ServiceRequest> requests = serviceRequestRepository.findAll();
            List<AgentRequestDto> dtos = requests.stream().map(r -> AgentRequestDto.builder()
                    .requestId(r.getRequestId())
                    .customerId(r.getCustomer() != null ? r.getCustomer().getCustomerId() : null)
                    .requestType(r.getRequestType() != null ? r.getRequestType().name() : null)
                    .status(r.getStatus() != null ? r.getStatus().name() : null)
                    .priority(r.getPriority() != null ? r.getPriority().name() : null)
                    .createdAt(r.getCreatedDate())
                    .lastUpdated(r.getLastUpdated())
                    .build()
            ).toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/premises")
    public ResponseEntity<List<Premise>> getPremises() {
        try {
            return ResponseEntity.ok(premiseRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/service-accounts")
    public ResponseEntity<List<com.cts.dto.AgentServiceAccountDto>> getServiceAccounts(
            @RequestParam(required = false) Long customerId) {
        try {
            if (customerId != null && customerId > 0) {
                return ResponseEntity.ok(agentDashboardService.getServiceAccounts(customerId));
            }
            // Return all service accounts if no customerId provided
            List<ServiceAccount> accounts = serviceAccountRepository.findAll();
            List<com.cts.dto.AgentServiceAccountDto> dtos = accounts.stream()
                    .map(a -> com.cts.dto.AgentServiceAccountDto.builder()
                            .id(a.getAccountId())
                            .customerId(a.getCustomer() != null ? a.getCustomer().getCustomerId() : null)
                            .serviceType(a.getServiceType() != null ? a.getServiceType().name() : null)
                            .status(a.getServiceAccountStatus() != null ? a.getServiceAccountStatus().name() : null)
                            .build()
                    ).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping("/meter-readings")
    public ResponseEntity<String> createMeterReading(@RequestBody MeterReadingUpsertDto dto) {
        ServiceAccount account = serviceAccountRepository.findById(dto.getServiceAccountId())
                .orElseThrow(() -> new CustomException("Service account not found"));

        MeterReading reading = MeterReading.builder()
                .serviceAccount(account)
                .readingDate(dto.getReadingDate())
                .readingValue(dto.getReadingValue())
                .source(dto.getSource())
                .qualityFlag(ReadingQualityFlag.RAW)
                .build();

        meterReadingRepository.save(reading);

        Long customerUserId = account.getCustomer() != null && account.getCustomer().getUser() != null
            ? account.getCustomer().getUser().getUserID()
            : null;
        safeNotifyUser(customerUserId, "New meter reading submitted for account " + account.getAccountId() + ".", NotificationType.SERVICE);
        notifyRoleUsers("ROLE_BILLING_ANALYST", "Meter reading submitted for account " + account.getAccountId() + ".", NotificationType.SERVICE);

        return ResponseEntity.ok("Meter reading submitted");
    }

    @PutMapping("/meter-readings/{readingId}/validate")
    public ResponseEntity<String> validateMeterReading(
            @PathVariable Long readingId,
            @RequestBody ValidateMeterReadingDto dto
    ) {
        MeterReading reading = meterReadingRepository.findById(readingId)
                .orElseThrow(() -> new CustomException("Meter reading not found"));

        ReadingQualityFlag status = dto.getQualityFlag() == null
                ? ReadingQualityFlag.VALIDATED
                : dto.getQualityFlag();

        reading.setQualityFlag(status);
        reading.setValidatedByUserId(securityUtil.getCurrentUserId());
        reading.setValidatedAt(java.time.LocalDate.now());
        meterReadingRepository.save(reading);

        ServiceAccount account = reading.getServiceAccount();
        Long customerUserId = account != null && account.getCustomer() != null && account.getCustomer().getUser() != null
            ? account.getCustomer().getUser().getUserID()
            : null;
        safeNotifyUser(customerUserId, "Your meter reading for account " + (account != null ? account.getAccountId() : "") + " is now " + status + ".", NotificationType.SERVICE);
        notifyRoleUsers("ROLE_BILLING_ANALYST", "Meter reading " + reading.getReadingId() + " marked as " + status + ".", NotificationType.SERVICE);

        return ResponseEntity.ok("Meter reading validated");
    }

    @GetMapping("/meter-readings/pending")
    public ResponseEntity<List<MeterReading>> getPendingMeterReadings() {
        return ResponseEntity.ok(meterReadingRepository.findByQualityFlagOrderByReadingDateDesc(ReadingQualityFlag.RAW));
    }

    private void safeNotifyUser(Long userId, String message, NotificationType type) {
        try {
            if (userId != null) {
                notificationService.createNotification(userId, message, type);
            }
        } catch (Exception ignored) {
        }
    }

    private void notifyRoleUsers(String roleName, String message, NotificationType type) {
        try {
            List<User> users = userRepository.findByRolesName(roleName);
            for (User u : users) {
                safeNotifyUser(u.getUserID(), message, type);
            }
        } catch (Exception ignored) {
        }
    }
}
