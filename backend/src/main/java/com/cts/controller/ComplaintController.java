package com.cts.controller;

import com.cts.dto.ComplaintResponseDto;
import com.cts.dto.CreateComplaintDto;
import com.cts.dto.ResolveComplaintDto;
import com.cts.enums.ComplaintCategory;
import com.cts.enums.ComplaintStatus;
import com.cts.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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

    @GetMapping
    public List<ComplaintResponseDto> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @GetMapping("/{complaintId}")
    public ComplaintResponseDto getComplaintById(@PathVariable Long complaintId) {
        return complaintService.getComplaintById(complaintId);
    }

    @GetMapping("/filter")
    public List<ComplaintResponseDto> filterComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) LocalDateTime fromDate,
            @RequestParam(required = false) LocalDateTime toDate) {
        return complaintService.filterComplaints(status, category, userId, fromDate, toDate);
    }
}
