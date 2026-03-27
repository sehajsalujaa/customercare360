package com.cts.dto;

import lombok.Data;

@Data
public class CreateDisputeDto {
    private Long billId;
    private String reason;
}
