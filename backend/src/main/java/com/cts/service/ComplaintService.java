//Logs complaints and retrieves them for customers/agents.

package com.cts.service;

import com.cts.dto.ComplaintDto;
import com.cts.entity.Complaint;

import java.util.List;

public interface ComplaintService {
    Complaint logComplaint(ComplaintDto dto);
    List<Complaint> getComplaintsByCustomer(Long customerId);
}
