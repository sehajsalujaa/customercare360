package com.cts.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDto {
    private String message;
    private String category;
    private String status;
    private LocalDateTime createdAt;
}
