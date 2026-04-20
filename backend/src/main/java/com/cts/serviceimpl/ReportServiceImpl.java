package com.cts.serviceimpl;

import com.cts.dto.DashboardResponseDto;
import com.cts.dto.GenerateReportDto;
import com.cts.entity.Bill;
import com.cts.entity.Complaint;
import com.cts.entity.OperationalReport;
import com.cts.enums.BillStatus;
import com.cts.enums.ComplaintStatus;
import com.cts.enums.CustomerStatus;
import com.cts.enums.ServiceType;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.repository.ComplaintRepository;
import com.cts.repository.CustomerRepository;
import com.cts.repository.OperationalReportRepository;
import com.cts.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final ComplaintRepository complaintRepository;
    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final OperationalReportRepository operationalReportRepository;

    @Override
    public OperationalReport getReportById(Long reportId) {
        return operationalReportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException("Report not found"));
    }

    @Override
    public String generateCsvReport(OperationalReport report) {
        StringBuilder csv = new StringBuilder();
        csv.append("ReportId,Scope,StartDate,EndDate,AvgResolutionTime,AdjustmentRate,ComplaintVolume,GeneratedDate\n");
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

        long complaintVolume = complaints.size();

        double avgResolutionTime = complaints.stream()
                .filter(c -> c.getResolvedAt() != null)
                .mapToLong(c -> Duration.between(c.getCreatedAt(), c.getResolvedAt()).toHours())
                .average()
                .orElse(0);

        long adjustedCount = bills.stream()
                .filter(b -> b.getBillStatus() == BillStatus.ADJUSTED)
                .count();
        double adjustmentRate = bills.isEmpty() ? 0 : (double) adjustedCount / bills.size();

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
    public List<OperationalReport> getAllReports() {
        return operationalReportRepository.findAllByOrderByGeneratedDateDesc();
    }

    @Override
    public DashboardResponseDto getDashboard(String serviceType, String startDate, String endDate) {
        // Parse optional filter parameters
        ServiceType svcType = (serviceType != null && !serviceType.isBlank()) ? ServiceType.valueOf(serviceType) : null;
        LocalDate from = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : null;
        LocalDate to   = (endDate   != null && !endDate.isBlank())   ? LocalDate.parse(endDate)   : null;
        LocalDateTime fromDt = (from != null) ? from.atStartOfDay() : null;
        LocalDateTime toDt   = (to   != null) ? to.atTime(23, 59, 59) : null;

        // Bill stats — filtered by serviceType and dueDate range
        long totalBills    = billRepository.countFiltered(svcType, from, to);
        long adjustedBills = billRepository.countFilteredByStatus(BillStatus.ADJUSTED, svcType, from, to);
        double accuracyRate = totalBills == 0 ? 1.0 : (double)(totalBills - adjustedBills) / totalBills;

        // Customer stats are global (not filtered by service type or date)
        long totalCustomers   = customerRepository.count();
        long activeCustomers  = customerRepository.countByCustomerStatus(CustomerStatus.ACTIVE);
        long pendingCustomers = customerRepository.countByCustomerStatus(CustomerStatus.PENDING);

        // Complaint stats — filtered by date range (complaints don't have a serviceType)
        long totalComplaints    = complaintRepository.countFiltered(fromDt, toDt);
        long openComplaints     = complaintRepository.countFilteredByStatus(ComplaintStatus.OPEN,     fromDt, toDt);
        long resolvedComplaints = complaintRepository.countFilteredByStatus(ComplaintStatus.RESOLVED, fromDt, toDt);

        // Billing trend — filtered
        Map<String, Long> billingTrend = new LinkedHashMap<>();
        for (Object[] row : billRepository.countBillsByMonthFiltered(svcType, from, to)) {
            String key = String.format("%04d-%02d",
                    ((Number) row[0]).intValue(), ((Number) row[1]).intValue());
            billingTrend.put(key, ((Number) row[2]).longValue());
        }

        // Complaint trend — filtered by date range
        Map<String, Long> complaintTrend = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countComplaintsByMonthFiltered(fromDt, toDt)) {
            String key = String.format("%04d-%02d",
                    ((Number) row[0]).intValue(), ((Number) row[1]).intValue());
            complaintTrend.put(key, ((Number) row[2]).longValue());
        }

        return DashboardResponseDto.builder()
                .totalBills(totalBills)
                .adjustedBills(adjustedBills)
                .accuracyRate(accuracyRate)
                .totalCustomers(totalCustomers)
                .activeCustomers(activeCustomers)
                .pendingCustomers(pendingCustomers)
                .totalComplaints(totalComplaints)
                .openComplaints(openComplaints)
                .resolvedComplaints(resolvedComplaints)
                .billingTrend(billingTrend)
                .complaintTrend(complaintTrend)
                .adjustmentsTrend(billingTrend)
                .build();
    }
}
