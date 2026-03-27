package com.cts.dto;

import com.cts.enums.Priority;
import lombok.Data;

@Data
public class UpdateRequestPriorityDto {
    private Long requestId;
    private Priority priority;
    private String supervisorNote;
}
