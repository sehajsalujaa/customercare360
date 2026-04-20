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
public class AgentRecentActivityDto {
    private String id;
    private String activityType;
    private String title;
    private String description;
    private LocalDateTime createdAt;
}
