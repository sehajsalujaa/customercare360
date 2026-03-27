package com.cts.serviceimpl;

import com.cts.dto.AssignServiceOrderDto;
import com.cts.dto.CreateServiceOrderDto;
import com.cts.dto.UpdateOrderStatusDto;
import com.cts.entity.Premise;
import com.cts.entity.ServiceAccount;
import com.cts.entity.ServiceOrder;
import com.cts.entity.ServiceRequest;
import com.cts.enums.RequestStatus;
import com.cts.enums.ServiceOrderStatus;
import com.cts.exception.CustomException;
import com.cts.repository.PremiseRepository;
import com.cts.repository.ServiceAccountRepository;
import com.cts.repository.ServiceOrderRepository;
import com.cts.repository.ServiceRequestRepository;
import com.cts.service.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceAccountRepository serviceAccountRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final PremiseRepository premiseRepository;

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
        }
        else if(dto.getServiceOrderStatus() == ServiceOrderStatus.FAILED){
            if(dto.getFailureReason() == null || dto.getFailureReason().isBlank()){
                throw new CustomException("Failure reason required");
            }
            order.setServiceOrderStatus(ServiceOrderStatus.FAILED);
            order.setCompletionDate(LocalDate.now());
            order.setFailureReason(dto.getFailureReason());

            serviceOrderRepository.save(order);
        }
    }

}
