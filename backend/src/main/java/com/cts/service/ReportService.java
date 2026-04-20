package com.cts.service;

import com.cts.dto.DashboardResponseDto;
import com.cts.dto.GenerateReportDto;
import com.cts.entity.OperationalReport;

import java.util.List;

public interface ReportService {
    OperationalReport generateReport(GenerateReportDto dto);
    OperationalReport getReportById(Long reportId);
    String generateCsvReport(OperationalReport operationalReport);
    DashboardResponseDto getDashboard(String serviceType, String startDate, String endDate);
    List<OperationalReport> getAllReports();
}
