package com.cts.dto;

import com.cts.enums.OrderType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateServiceOrderDto {
    private Long requestId;
    private Long serviceAccountId;
    private Long premiseId;
    private OrderType orderType;
    private LocalDate scheduledDate;
}
