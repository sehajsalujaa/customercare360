package com.cts.serviceimpl;

import com.cts.dto.RequestStatusResponseDto;
import com.cts.dto.UpdateRequestPriorityDto;
import com.cts.entity.ServiceOrder;
import com.cts.entity.ServiceRequest;
import com.cts.entity.User;
import com.cts.enums.NotificationType;
import com.cts.enums.Priority;
import com.cts.exception.CustomException;
import com.cts.repository.ServiceOrderRepository;
import com.cts.repository.ServiceRequestRepository;
import com.cts.repository.UserRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.AuditService;
import com.cts.service.NotificationService;
import com.cts.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final SecurityUtil securityUtil;

    @Override
    public void updateRequestPriority(UpdateRequestPriorityDto dto) {
        ServiceRequest request = serviceRequestRepository
                .findById(dto.getRequestId())
                .orElseThrow(() -> new CustomException("Request not found"));
        if(dto.getPriority() == Priority.P1 && dto.getSupervisorNote() == null){
            throw new CustomException("Supervisor note required for P1 priority");
        }
        request.setPriority(dto.getPriority());
        request.setSupervisorNote(dto.getSupervisorNote());
        request.setLastUpdated(LocalDateTime.now());
        serviceRequestRepository.save(request);

        Long customerUserId = request.getCustomer() != null && request.getCustomer().getUser() != null
            ? request.getCustomer().getUser().getUserID()
            : null;
        safeNotifyUser(
            customerUserId,
            "Priority updated for request #" + request.getRequestId() + " to " + request.getPriority() + ".",
            NotificationType.SERVICE
        );
        notifyRoleUsers(
            "ROLE_FIELD_COORDINATOR",
            "Request #" + request.getRequestId() + " priority updated to " + request.getPriority() + ".",
            NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "ServiceRequest");
    }

    @Override
    public RequestStatusResponseDto getRequestStatus(Long requestId) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("Request not found"));
        ServiceOrder order = serviceOrderRepository.findByServiceRequest(request);
        return RequestStatusResponseDto.builder()
                .requestStatus(request.getStatus().name())
                .orderStatus(order != null ? order.getServiceOrderStatus().name() : "NOT_CREATED")
                .lastUpdated(
                        order != null && order.getCompletionDate() != null
                                ? order.getCompletionDate().atStartOfDay()
                                : request.getCreatedDate()
                )
                .build();
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
            for (User u : userRepository.findByRolesName(roleName)) {
                safeNotifyUser(u.getUserID(), message, type);
            }
        } catch (Exception ignored) {
        }
    }
}
