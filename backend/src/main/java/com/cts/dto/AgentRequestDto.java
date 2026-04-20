package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentRequestDto {
    private Long requestId;
    private Long customerId;
    private String requestType;
    private String status;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
}
