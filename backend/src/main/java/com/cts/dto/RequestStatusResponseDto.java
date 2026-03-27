package com.cts.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RequestStatusResponseDto {
    private String requestStatus;
    private String orderStatus;
    private LocalDateTime lastUpdated;
}
