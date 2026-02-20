//Allows customers to raise service requests, check status, and agents/admins to approve/reject.

package com.cts.service;

import com.cts.dto.ServiceRequestDto;
import com.cts.entity.ServiceRequest;

import java.util.List;

public interface ServiceRequestService {
    ServiceRequest createRequest(ServiceRequestDto dto);
    ServiceRequest getRequestStatus(Long requestId);
    ServiceRequest updateRequestStatus(Long requestId, String status);
    List<ServiceRequest> getRequestsByCustomer(Long customerId);
}
