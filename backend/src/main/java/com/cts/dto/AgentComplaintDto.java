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
public class AgentComplaintDto {
    private Long id;
    private Long userId;
    private String complaintCategory;
    private String complaintStatus;
    private String description;
    private LocalDateTime createdAt;
}
