package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentServiceAccountDto {
    private Long id;
    private Long customerId;
    private String serviceType;
    private String status;
}
