package com.cts.serviceimpl;

import com.cts.dto.RequestStatusResponseDto;
import com.cts.dto.UpdateRequestPriorityDto;
import com.cts.entity.ServiceOrder;
import com.cts.entity.ServiceRequest;
import com.cts.enums.Priority;
import com.cts.exception.CustomException;
import com.cts.repository.ServiceOrderRepository;
import com.cts.repository.ServiceRequestRepository;
import com.cts.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceOrderRepository serviceOrderRepository;

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

}
