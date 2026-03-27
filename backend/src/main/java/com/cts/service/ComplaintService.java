//Logs complaints and retrieves them for customers/agents.

package com.cts.service;

import com.cts.dto.ComplaintDto;
import com.cts.dto.CreateComplaintDto;
import com.cts.dto.ResolveComplaintDto;
import com.cts.entity.Complaint;

import java.util.List;

public interface ComplaintService {
    void createComplaint(CreateComplaintDto dto);
    void resolveComplaint(ResolveComplaintDto dto);
}
