package com.cts.controller;

import com.cts.dto.DashboardResponseDto;
import com.cts.dto.GenerateReportDto;
import com.cts.entity.OperationalReport;
import com.cts.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping("/generate")
    public OperationalReport generate(@RequestBody GenerateReportDto dto) {
        return reportService.generateReport(dto);
    }

    @GetMapping("/export/{reportId}")
    public ResponseEntity<String> exportReport(@PathVariable Long reportId) {
        OperationalReport report = reportService.getReportById(reportId);
        String csv = reportService.generateCsvReport(report);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csv);
    }

    @GetMapping("/dashboard")
    public DashboardResponseDto getDashboard(
            @RequestParam String serviceType,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return reportService.getDashboard(serviceType, startDate, endDate);
    }
}
