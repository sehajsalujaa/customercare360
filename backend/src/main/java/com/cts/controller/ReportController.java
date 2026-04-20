package com.cts.controller;

import com.cts.dto.DashboardResponseDto;
import com.cts.dto.GenerateReportDto;
import com.cts.entity.OperationalReport;
import com.cts.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping("/generate")
    public OperationalReport generate(@RequestBody GenerateReportDto dto) {
        return reportService.generateReport(dto);
    }

    @GetMapping("/list")
    public List<OperationalReport> listReports() {
        return reportService.getAllReports();
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
    public ResponseEntity<?> getDashboard(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        try {
            return ResponseEntity.ok(
                    reportService.getDashboard(serviceType, startDate, endDate)
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
