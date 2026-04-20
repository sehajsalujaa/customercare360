//Logs complaints and retrieves them for customers/agents.

package com.cts.service;

import com.cts.dto.ComplaintResponseDto;
import com.cts.dto.CreateComplaintDto;
import com.cts.dto.ResolveComplaintDto;
import com.cts.enums.ComplaintCategory;
import com.cts.enums.ComplaintStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface ComplaintService {
    void createComplaint(CreateComplaintDto dto);
    void resolveComplaint(ResolveComplaintDto dto);
    ComplaintResponseDto getComplaintById(Long complaintId);
    List<ComplaintResponseDto> getAllComplaints();
    List<ComplaintResponseDto> filterComplaints(ComplaintStatus status, ComplaintCategory category, 
                                                  Long userId, LocalDateTime fromDate, LocalDateTime toDate);
}
