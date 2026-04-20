package com.cts.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class BillingDisputeResponseDto {
    private Long disputeId;
    private Long billId;
    private String customerName;
    private String customerEmail;
    private String serviceType;
    private LocalDate dueDate;
    private Double currentBillAmount;
    private String reason;
    private String status;
    private String approver;
    private Double amountDelta;
    private String decisionReason;
}
