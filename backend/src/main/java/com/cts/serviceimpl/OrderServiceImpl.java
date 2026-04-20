package com.cts.serviceimpl;

import com.cts.dto.AssignServiceOrderDto;
import com.cts.dto.CreateServiceOrderDto;
import com.cts.dto.ServiceOrderResponseDto;
import com.cts.dto.UpdateOrderStatusDto;
import com.cts.entity.Premise;
import com.cts.entity.ServiceAccount;
import com.cts.entity.ServiceOrder;
import com.cts.entity.ServiceRequest;
import com.cts.entity.User;
import com.cts.enums.NotificationType;
import com.cts.enums.RequestStatus;
import com.cts.enums.ServiceOrderStatus;
import com.cts.exception.CustomException;
import com.cts.repository.PremiseRepository;
import com.cts.repository.ServiceAccountRepository;
import com.cts.repository.ServiceOrderRepository;
import com.cts.repository.ServiceRequestRepository;
import com.cts.repository.UserRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.AuditService;
import com.cts.service.NotificationService;
import com.cts.service.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceAccountRepository serviceAccountRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final PremiseRepository premiseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final SecurityUtil securityUtil;

    @Override
    public void createServiceOrder(CreateServiceOrderDto dto) {
        ServiceRequest request = serviceRequestRepository
                .findById(dto.getRequestId())
                .orElseThrow(() -> new CustomException("Service request not found"));
        ServiceAccount account = serviceAccountRepository
                .findById(dto.getServiceAccountId())
                .orElseThrow(() -> new CustomException("Service account not found"));
        Premise premise = premiseRepository
                .findById(dto.getPremiseId())
                .orElseThrow(() -> new CustomException("Premise not found"));
        if(dto.getScheduledDate().isBefore(LocalDate.now())){
            throw new CustomException("Scheduled date must be today or future");
        }
        ServiceOrder order = ServiceOrder.builder()
                .serviceRequest(request)
                .serviceAccount(account)
                .premise(premise)
                .orderType(dto.getOrderType())
                .scheduledDate(dto.getScheduledDate())
                .serviceOrderStatus(ServiceOrderStatus.SCHEDULED)
                .build();
        serviceOrderRepository.save(order);

            Long customerUserId = request.getCustomer() != null && request.getCustomer().getUser() != null
                ? request.getCustomer().getUser().getUserID()
                : null;
            safeNotifyUser(customerUserId, "Service order #" + order.getOrderId() + " has been scheduled.", NotificationType.SERVICE);
            notifyRoleUsers("ROLE_FIELD_COORDINATOR", "New service order #" + order.getOrderId() + " has been created.", NotificationType.SERVICE);

        auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "ServiceOrder");
    }

    @Override
    public void assignServiceOrder(AssignServiceOrderDto dto) {
        ServiceOrder order = serviceOrderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new CustomException("Service order not found"));
        String previousTech = order.getTechnicianName();
        order.setTechnicianName(dto.getTechnicianName());
        if(previousTech != null && !previousTech.equals(dto.getTechnicianName())){
            order.setReassignmentLog(
                    "Reassigned from " + previousTech + " to " + dto.getTechnicianName()
            );
        }
        serviceOrderRepository.save(order);

        Long customerUserId = order.getServiceRequest() != null && order.getServiceRequest().getCustomer() != null
            && order.getServiceRequest().getCustomer().getUser() != null
            ? order.getServiceRequest().getCustomer().getUser().getUserID()
            : null;
        safeNotifyUser(customerUserId, "Service order #" + order.getOrderId() + " assigned to technician " + dto.getTechnicianName() + ".", NotificationType.SERVICE);

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "ServiceOrder");
    }

    @Override
    public void updateOrderStatus(UpdateOrderStatusDto dto) {
        ServiceOrder order = serviceOrderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new CustomException("Service order not found"));
        if(dto.getServiceOrderStatus() == ServiceOrderStatus.COMPLETED){
            order.setServiceOrderStatus(ServiceOrderStatus.COMPLETED);
            order.setCompletionDate(LocalDate.now());
            ServiceRequest request = order.getServiceRequest();
            if(request != null){
                request.setStatus(RequestStatus.RESOLVED);
                serviceRequestRepository.save(request);
            }
            serviceOrderRepository.save(order);

            Long customerUserId = request != null && request.getCustomer() != null && request.getCustomer().getUser() != null
                    ? request.getCustomer().getUser().getUserID()
                    : null;
            safeNotifyUser(customerUserId, "Service order #" + order.getOrderId() + " has been completed.", NotificationType.SERVICE);
        }
        else if(dto.getServiceOrderStatus() == ServiceOrderStatus.FAILED){
            if(dto.getFailureReason() == null || dto.getFailureReason().isBlank()){
                throw new CustomException("Failure reason required");
            }
            order.setServiceOrderStatus(ServiceOrderStatus.FAILED);
            order.setCompletionDate(LocalDate.now());
            order.setFailureReason(dto.getFailureReason());

            serviceOrderRepository.save(order);

            Long customerUserId = order.getServiceRequest() != null && order.getServiceRequest().getCustomer() != null
                    && order.getServiceRequest().getCustomer().getUser() != null
                    ? order.getServiceRequest().getCustomer().getUser().getUserID()
                    : null;
            safeNotifyUser(customerUserId, "Service order #" + order.getOrderId() + " failed: " + dto.getFailureReason(), NotificationType.SERVICE);
        }
        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "ServiceOrder");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceOrderResponseDto> getAllOrders(String status) {
        List<ServiceOrder> orders;
        if (status != null && !status.isBlank()) {
            try {
                ServiceOrderStatus s = ServiceOrderStatus.valueOf(status.toUpperCase());
                orders = serviceOrderRepository.findByServiceOrderStatusOrderByOrderIdDesc(s);
            } catch (IllegalArgumentException e) {
                orders = serviceOrderRepository.findAllByOrderByOrderIdDesc();
            }
        } else {
            orders = serviceOrderRepository.findAllByOrderByOrderIdDesc();
        }
        return orders.stream().map(this::toDto).toList();
    }

    private ServiceOrderResponseDto toDto(ServiceOrder o) {
        ServiceOrderResponseDto dto = new ServiceOrderResponseDto();
        dto.setOrderId(o.getOrderId());
        dto.setOrderType(o.getOrderType() != null ? o.getOrderType().name() : null);
        dto.setServiceOrderStatus(o.getServiceOrderStatus() != null ? o.getServiceOrderStatus().name() : null);
        dto.setScheduledDate(o.getScheduledDate());
        dto.setCompletionDate(o.getCompletionDate());
        dto.setTechnicianName(o.getTechnicianName());
        dto.setFailureReason(o.getFailureReason());
        dto.setReassignmentLog(o.getReassignmentLog());
        if (o.getServiceAccount() != null) {
            dto.setServiceAccountId(o.getServiceAccount().getAccountId());
            dto.setServiceType(o.getServiceAccount().getServiceType() != null ? o.getServiceAccount().getServiceType().name() : null);
        }
        if (o.getPremise() != null) {
            dto.setPremiseId(o.getPremise().getPremiseId());
            dto.setAddress(o.getPremise().getAddress());
            dto.setRegion(o.getPremise().getRegion());
            dto.setMeterId(o.getPremise().getMeterId());
        }
        if (o.getServiceRequest() != null) {
            ServiceRequest req = o.getServiceRequest();
            dto.setRequestId(req.getRequestId());
            dto.setRequestType(req.getRequestType() != null ? req.getRequestType().name() : null);
            dto.setPriority(req.getPriority() != null ? req.getPriority().name() : null);
            dto.setRequestStatus(req.getStatus() != null ? req.getStatus().name() : null);
            if (req.getCustomer() != null) {
                dto.setCustomerName(req.getCustomer().getName());
            }
        }
        return dto;
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
