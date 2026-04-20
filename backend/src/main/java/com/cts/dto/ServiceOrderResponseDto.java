package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceOrderResponseDto {
    private Long orderId;
    private String orderType;
    private String serviceOrderStatus;
    private LocalDate scheduledDate;
    private LocalDate completionDate;
    private String technicianName;
    private String failureReason;
    private String reassignmentLog;

    // Service account info
    private Long serviceAccountId;
    private String serviceType;

    // Premise info
    private Long premiseId;
    private String address;
    private String region;
    private String meterId;

    // Service request info
    private Long requestId;
    private String requestType;
    private String priority;
    private String requestStatus;
    private String customerName;
}
