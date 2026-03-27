package com.cts.dto;

import com.cts.enums.ComplaintCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplaintDto {
    private Long userId;
    private ComplaintCategory complaintCategory;
    private String description;
}
