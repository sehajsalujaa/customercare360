package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long billId;
    private String reason;
    private Double amountDelta;
    private String approvedBy;
    private String status;
}
