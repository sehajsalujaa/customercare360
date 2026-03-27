package com.cts.serviceimpl;

import com.cts.dto.DashboardResponseDto;
import com.cts.dto.GenerateReportDto;
import com.cts.entity.Bill;
import com.cts.entity.Complaint;
import com.cts.entity.OperationalReport;
import com.cts.enums.BillStatus;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.repository.ComplaintRepository;
import com.cts.repository.OperationalReportRepository;
import com.cts.service.ReportService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final ComplaintRepository complaintRepository;
    private final BillRepository billRepository;
    private final OperationalReportRepository operationalReportRepository;

    @Override
    public OperationalReport getReportById(Long reportId) {
        return operationalReportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException("Report not found"));
    }

    @Override
    public String generateCsvReport(OperationalReport report) {
        StringBuilder csv = new StringBuilder();
        // Header
        csv.append("ReportId,Scope,StartDate,EndDate,AvgResolutionTime,AdjustmentRate,ComplaintVolume,GeneratedDate\n");
        // Data
        csv.append(report.getReportId()).append(",")
                .append(report.getScope()).append(",")
                .append(report.getStartDate()).append(",")
                .append(report.getEndDate()).append(",")
                .append(report.getAvgResolutionTime()).append(",")
                .append(report.getAdjustmentRate()).append(",")
                .append(report.getComplaintVolume()).append(",")
                .append(report.getGeneratedDate()).append("\n");
        return csv.toString();
    }

    @Override
    public OperationalReport generateReport(GenerateReportDto dto) {
        List<Complaint> complaints = complaintRepository.findAll();
        List<Bill> bills = billRepository.findAll();
        // Complaint Volume
        long complaintVolume = complaints.size();
        // Avg Resolution Time
        double avgResolutionTime = complaints.stream()
                .filter(c -> c.getResolvedAt() != null)
                .mapToLong(c -> Duration.between(c.getCreatedAt(), c.getResolvedAt()).toHours())
                .average()
                .orElse(0);
        // Adjustment Rate
        long adjustedCount = bills.stream()
                .filter(b -> b.getBillStatus() == BillStatus.ADJUSTED)
                .count();
        double adjustmentRate = bills.isEmpty() ? 0 :
                (double) adjustedCount / bills.size();
        // ✅ Build report
        OperationalReport report = OperationalReport.builder()
                .scope(dto.getScope())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .avgResolutionTime(avgResolutionTime)
                .adjustmentRate(adjustmentRate)
                .complaintVolume(complaintVolume)
                .generatedDate(LocalDateTime.now())
                .build();
        return operationalReportRepository.save(report);
    }

    @Override
    public DashboardResponseDto getDashboard(String serviceType, String startDate, String endDate) {
        // Example logic (you can refine later)
        long totalBills = billRepository.count();
        long adjustedBills = billRepository.countByBillStatus(BillStatus.ADJUSTED);
        double accuracyRate = totalBills == 0 ? 0 :
                ((double) (totalBills - adjustedBills) / totalBills);
        // Fake trend for now (later you can group by date)
        Map<String, Long> trend = new HashMap<>();
        trend.put("2026-03-01", 2L);
        trend.put("2026-03-02", 1L);
        return DashboardResponseDto.builder()
                .adjustmentsTrend(trend)
                .accuracyRate(accuracyRate)
                .totalBills(totalBills)
                .adjustedBills(adjustedBills)
                .build();
    }
}
