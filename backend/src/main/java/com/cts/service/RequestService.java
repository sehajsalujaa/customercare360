package com.cts.service;

import com.cts.dto.CreateServiceOrderDto;
import com.cts.dto.RequestStatusResponseDto;
import com.cts.dto.UpdateRequestPriorityDto;

public interface RequestService {
    void updateRequestPriority(UpdateRequestPriorityDto dto);
    RequestStatusResponseDto getRequestStatus(Long requestId);
}
