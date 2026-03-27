package com.cts.dto;

import com.cts.enums.ServiceOrderStatus;
import lombok.Data;

@Data
public class UpdateOrderStatusDto {
    private Long orderId;
    private ServiceOrderStatus serviceOrderStatus;
    private String failureReason;
}
