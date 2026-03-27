package com.cts.dto;

import com.cts.enums.BillDisputeStatus;
import lombok.Data;

@Data
public class ResolveDisputeDto {
    private Long disputeId;
    private BillDisputeStatus status;
    private Double amountDelta;
    private String approver;
    private String decisionReason;
}
