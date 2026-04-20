package com.cts.dto;

import com.cts.enums.ComplaintCategory;
import com.cts.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponseDto {
    private Long complaintId;
    private Long userId;
    private String userName;
    private String userEmail;
    private ComplaintCategory complaintCategory;
    private String description;
    private ComplaintStatus complaintStatus;
    private LocalDateTime createdAt;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private boolean slaMet;
}
