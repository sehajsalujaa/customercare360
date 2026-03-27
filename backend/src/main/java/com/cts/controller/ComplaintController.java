package com.cts.controller;

import com.cts.dto.CreateComplaintDto;
import com.cts.dto.ResolveComplaintDto;
import com.cts.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;

    @PostMapping("/create")
    public String createComplaint(@RequestBody CreateComplaintDto dto) {
        complaintService.createComplaint(dto);
        return "Complaint logged successfully";
    }

    @PostMapping("/resolve")
    public String resolveComplaint(@RequestBody ResolveComplaintDto dto) {
        complaintService.resolveComplaint(dto);
        return "Complaint resolved successfully";
    }
}