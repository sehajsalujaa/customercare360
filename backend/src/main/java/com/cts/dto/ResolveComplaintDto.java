package com.cts.dto;

import com.cts.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveComplaintDto {
    private Long complaintId;
    private ComplaintStatus complaintStatus;
    private String resolutionNotes;
}
