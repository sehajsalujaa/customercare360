package com.cts.serviceimpl;

import com.cts.dto.BillingCycleResponseDto;
import com.cts.dto.CreateBillingCycleDto;
import com.cts.entity.Bill;
import com.cts.entity.BillingCycle;
import com.cts.entity.MeterReading;
import com.cts.entity.ServiceAccount;
import com.cts.entity.TariffPlan;
import com.cts.entity.TariffSlab;
import com.cts.entity.User;
import com.cts.enums.BillGenerationSource;
import com.cts.enums.BillStatus;
import com.cts.enums.BillingCycleStatus;
import com.cts.enums.NotificationType;
import com.cts.enums.ReadingQualityFlag;
import com.cts.enums.ServiceAccountStatus;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.repository.BillingCycleRepository;
import com.cts.repository.MeterReadingRepository;
import com.cts.repository.ServiceAccountRepository;
import com.cts.repository.TariffPlanRepository;
import com.cts.repository.UserRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.AuditService;
import com.cts.service.BillingCycleService;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BillingCycleServiceImpl implements BillingCycleService {
    private final BillingCycleRepository billingCycleRepository;
    private final ServiceAccountRepository serviceAccountRepository;
    private final BillRepository billRepository;
        private final MeterReadingRepository meterReadingRepository;
        private final TariffPlanRepository tariffPlanRepository;
        private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final SecurityUtil securityUtil;

    @Override
    public void createBillingCycle(CreateBillingCycleDto dto) {
        if(dto.getStartDate().isAfter(dto.getEndDate())){
            throw new CustomException("Start date cannot be after end date");
        }
        boolean exists = billingCycleRepository
                .existsByServiceTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        dto.getServiceType(),
                        dto.getEndDate(),
                        dto.getStartDate()
                );
        if(exists){
            throw new CustomException("Billing cycle already exists for this period");
        }
        BillingCycle cycle = BillingCycle.builder()
                .serviceType(dto.getServiceType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .billDate(dto.getBillDate())
                .billingCycleStatus(BillingCycleStatus.OPEN)
                .build();
        billingCycleRepository.save(cycle);

        notifyRoleUsers(
                "ROLE_BILLING_ANALYST",
                "Billing cycle created for " + dto.getServiceType() + " from " + dto.getStartDate() + " to " + dto.getEndDate() + ".",
                NotificationType.BILL
        );
        notifyRoleUsers(
                "ROLE_ADMIN",
                "Billing cycle created for " + dto.getServiceType() + " from " + dto.getStartDate() + " to " + dto.getEndDate() + ".",
                NotificationType.BILL
        );

        auditService.logAction(
                securityUtil.getCurrentUserId(),
                "CREATE",
                "BillingCycle");
    }

    @Override
    public String generateBills(Long cycleId) {
        try {
            BillingCycle cycle = billingCycleRepository.findById(cycleId)
                    .orElseThrow(() -> new CustomException("Cycle not found"));
            List<ServiceAccount> accounts =
                    serviceAccountRepository.findByServiceAccountStatusAndServiceType(ServiceAccountStatus.ACTIVE, cycle.getServiceType());

            if (accounts.isEmpty()) {
                return "No active service accounts found for this service type";
            }

            int success = 0;
            int failed = 0;

            for (ServiceAccount account : accounts) {
                try {
                                        if (account.getCustomer() == null || account.getCustomer().getCustomerType() == null) {
                                                upsertFailedBill(cycle, account, "Customer type missing for service account " + account.getAccountId());
                                                failed++;
                                                continue;
                                        }

                    Optional<MeterReading> previousReadingOpt = meterReadingRepository
                            .findTopByServiceAccountAccountIdAndReadingDateLessThanAndQualityFlagOrderByReadingDateDesc(
                                    account.getAccountId(),
                                    cycle.getStartDate(),
                                    ReadingQualityFlag.VALIDATED
                            );
                    Optional<MeterReading> currentReadingOpt = meterReadingRepository
                            .findTopByServiceAccountAccountIdAndReadingDateLessThanEqualAndQualityFlagOrderByReadingDateDesc(
                                    account.getAccountId(),
                                    cycle.getEndDate(),
                                    ReadingQualityFlag.VALIDATED
                            );

                                        if (currentReadingOpt.isEmpty()) {
                                                upsertFailedBill(cycle, account, "Missing current validated meter reading for account " + account.getAccountId() + " within cycle end date");
                                                failed++;
                                                continue;
                                        }

                                        MeterReading previous = previousReadingOpt.orElse(null);
                                        MeterReading current = currentReadingOpt.get();

                                        double usage;
                                        if (previous == null) {
                                                boolean firstCycleForAccount = account.getStartDate() != null && !account.getStartDate().isBefore(cycle.getStartDate());
                                                if (!firstCycleForAccount) {
                                                        upsertFailedBill(cycle, account, "Missing previous validated reading for account " + account.getAccountId() + " before cycle start");
                                                        failed++;
                                                        continue;
                                                }
                                                usage = Math.max(0D, safe(current.getReadingValue()));
                                        } else {
                                                if (current.getReadingDate().isBefore(previous.getReadingDate())) {
                                                        upsertFailedBill(cycle, account, "Invalid reading order for billing cycle");
                                                        failed++;
                                                        continue;
                                                }
                                                usage = Math.max(0D, safe(current.getReadingValue()) - safe(previous.getReadingValue()));
                                        }

                    TariffPlan tariffPlan = resolveTariffPlan(cycle, account)
                            .orElseThrow(() -> new CustomException("No active tariff plan found for account " + account.getAccountId() + ". Customer type: " + (account.getCustomer() != null ? account.getCustomer().getCustomerType() : "UNKNOWN")));

                    ChargeBreakdown breakdown = calculateAmount(usage, tariffPlan);

                    Bill bill = billRepository
                            .findByBillingCycleCycleIdAndServiceAccountAccountId(cycle.getCycleId(), account.getAccountId())
                            .orElse(Bill.builder().serviceAccount(account).billingCycle(cycle).build());

                    bill.setUsage(usage);
                    bill.setAmount(breakdown.totalAmount());
                    bill.setFromDate(cycle.getStartDate());
                    bill.setToDate(cycle.getEndDate());
                                        bill.setDueDate(cycle.getBillDate().plusDays(15));
                                        bill.setBillStatus(BillStatus.GENERATED);
                                        bill.setGenerationSource(BillGenerationSource.METERED);
                                        bill.setErrorMessage(null);
                                        bill.setBillBreakdown(toBreakdownJson(previous, current, tariffPlan, breakdown));

                                        billRepository.save(bill);

                                        try {
                                                if (account.getCustomer() != null && account.getCustomer().getUser() != null) {
                                                        Long userId = account.getCustomer().getUser().getUserID();
                                                        notificationService.createNotification(
                                                                        userId,
                                                                        "Your bill has been generated",
                                                                        NotificationType.BILL
                                                        );
                                                }
                                        } catch (Exception ignored) {
                                                // Notification failure should not fail bill generation
                                        }

                                        success++;
                                } catch (Exception e) {
                                        upsertFailedBill(cycle, account, e.getMessage());
                                        failed++;
                                }
            }
                        String summary = "Bills generated for cycle " + cycleId + ": success=" + success + ", failed=" + failed;
                        notifyRoleUsers("ROLE_BILLING_ANALYST", summary, NotificationType.BILL);
                        notifyRoleUsers("ROLE_ADMIN", summary, NotificationType.BILL);
                        return "Bills generated: " + success + ", Failed: " + failed;
                } catch (Exception e) {
                        e.printStackTrace();
                        System.out.println("Error generating bills for cycle " + cycleId + ": " + e.getMessage());
                        throw new CustomException("Bill generation failed: " + e.getMessage());
                }
    }

    @Override
    public void closeBillingCycle(Long cycleId) {
        BillingCycle cycle = billingCycleRepository.findById(cycleId)
                .orElseThrow(() -> new CustomException("Cycle not found"));
        List<Bill> bills = billRepository.findByBillingCycleCycleId(cycleId);
        boolean allProcessed = bills.stream().allMatch(bill ->
                bill.getBillStatus() == BillStatus.GENERATED ||
                        bill.getBillStatus() == BillStatus.SENT ||
                        bill.getBillStatus() == BillStatus.OVERDUE ||
                        bill.getBillStatus() == BillStatus.PAID ||
                        bill.getBillStatus() == BillStatus.ADJUSTED
        );
        if (!allProcessed) {
            throw new CustomException("All bills must be processed before closing cycle");
        }
        cycle.setBillingCycleStatus(BillingCycleStatus.COMPLETED);
        billingCycleRepository.save(cycle);
        notifyRoleUsers(
                "ROLE_BILLING_ANALYST",
                "Billing cycle " + cycle.getCycleId() + " has been closed.",
                NotificationType.BILL
        );
        notifyRoleUsers(
                "ROLE_ADMIN",
                "Billing cycle " + cycle.getCycleId() + " has been closed.",
                NotificationType.BILL
        );
        auditService.logAction(
                securityUtil.getCurrentUserId(),
                "UPDATE",
                "BillingCycle");
    }

        @Override
        public List<BillingCycleResponseDto> getAllCycles() {
                return billingCycleRepository.findAllByOrderByStartDateDesc()
                                .stream()
                                .map(cycle -> BillingCycleResponseDto.builder()
                                                .cycleId(cycle.getCycleId())
                                                .serviceType(cycle.getServiceType() != null ? cycle.getServiceType().name() : null)
                                                .startDate(cycle.getStartDate())
                                                .endDate(cycle.getEndDate())
                                                .billDate(cycle.getBillDate())
                                                .status(cycle.getBillingCycleStatus() != null ? cycle.getBillingCycleStatus().name() : null)
                                                .build())
                                .toList();
        }

        private void upsertFailedBill(BillingCycle cycle, ServiceAccount account, String reason) {
                Bill failedBill = billRepository
                                .findByBillingCycleCycleIdAndServiceAccountAccountId(cycle.getCycleId(), account.getAccountId())
                                .orElse(Bill.builder().serviceAccount(account).billingCycle(cycle).build());

                failedBill.setBillStatus(BillStatus.FAILED);
                failedBill.setFromDate(cycle.getStartDate());
                failedBill.setToDate(cycle.getEndDate());
                failedBill.setErrorMessage(reason != null ? reason : "Bill generation failed");
                failedBill.setGenerationSource(BillGenerationSource.METERED);
                billRepository.save(failedBill);
        }

        private Optional<TariffPlan> resolveTariffPlan(BillingCycle cycle, ServiceAccount account) {
                if (account.getCustomer() == null || account.getCustomer().getCustomerType() == null) {
                        throw new CustomException("Customer type missing for tariff resolution");
                }

                var customerType = account.getCustomer().getCustomerType();
                String region = account.getPremise() != null ? account.getPremise().getRegion() : null;
                if (region != null && !region.isBlank()) {
                        Optional<TariffPlan> exact = tariffPlanRepository
                                        .findFirstByActiveTrueAndServiceTypeAndCustomerTypeAndRegionAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrderByEffectiveFromDesc(
                                                        cycle.getServiceType(),
                                                        customerType,
                                                        region,
                                                        cycle.getStartDate(),
                                                        cycle.getEndDate()
                                        );
                        if (exact.isPresent()) {
                                return exact;
                        }
                }

                return tariffPlanRepository
                                .findFirstByActiveTrueAndServiceTypeAndCustomerTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrderByEffectiveFromDesc(
                                                cycle.getServiceType(),
                                                customerType,
                                                cycle.getStartDate(),
                                                cycle.getEndDate()
                                );
        }

        private ChargeBreakdown calculateAmount(double usage, TariffPlan tariffPlan) {
                List<TariffSlab> slabs = tariffPlan.getSlabs().stream()
                                .sorted(Comparator.comparing(TariffSlab::getStartUnit, Comparator.nullsFirst(Comparator.naturalOrder())))
                                .toList();

                double remaining = usage;
                double energyCharge = 0D;

                for (TariffSlab slab : slabs) {
                        if (remaining <= 0) break;
                        double slabStart = safe(slab.getStartUnit());
                        double slabEnd = slab.getEndUnit() == null ? Double.MAX_VALUE : slab.getEndUnit();
                        double slabSize = Math.max(0D, slabEnd - slabStart);
                        double consumedInSlab = slab.getEndUnit() == null ? remaining : Math.min(remaining, slabSize);
                        if (consumedInSlab <= 0) continue;
                        energyCharge += consumedInSlab * safe(slab.getRatePerUnit());
                        remaining -= consumedInSlab;
                }

                if (slabs.isEmpty()) {
                        throw new CustomException("Tariff slab configuration missing");
                }

                if (remaining > 0) {
                        TariffSlab last = slabs.get(slabs.size() - 1);
                        energyCharge += remaining * safe(last.getRatePerUnit());
                }

                double fixedCharge = safe(tariffPlan.getFixedCharge());
                double duty = (energyCharge * safe(tariffPlan.getDutyPercent())) / 100D;
                double taxableBase = energyCharge + fixedCharge + duty;
                double tax = (taxableBase * safe(tariffPlan.getTaxPercent())) / 100D;
                double subsidy = safe(tariffPlan.getSubsidyAmount());
                double total = Math.max(0D, taxableBase + tax - subsidy);

                return new ChargeBreakdown(round(energyCharge), round(fixedCharge), round(duty), round(tax), round(subsidy), round(total));
        }

        private String toBreakdownJson(MeterReading previous, MeterReading current, TariffPlan tariffPlan, ChargeBreakdown breakdown) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("previousReadingDate", previous != null ? previous.getReadingDate() : null);
                m.put("previousReadingValue", previous != null ? previous.getReadingValue() : null);
                m.put("currentReadingDate", current != null ? current.getReadingDate() : null);
                m.put("currentReadingValue", current != null ? current.getReadingValue() : null);
                m.put("tariffPlanId", tariffPlan.getTariffPlanId());
                m.put("energyCharge", breakdown.energyCharge());
                m.put("fixedCharge", breakdown.fixedCharge());
                m.put("duty", breakdown.duty());
                m.put("tax", breakdown.tax());
                m.put("subsidy", breakdown.subsidy());
                m.put("totalAmount", breakdown.totalAmount());
                return m.toString();
        }

        private static double safe(Double value) {
                return value == null ? 0D : value;
        }

        private static double round(double value) {
                return Math.round(value * 100.0) / 100.0;
        }

        private void safeNotifyUser(Long userId, String message, NotificationType type) {
                try {
                        if (userId != null) {
                                notificationService.createNotification(userId, message, type);
                        }
                } catch (Exception ignored) {
                }
        }

        private void notifyRoleUsers(String roleName, String message, NotificationType type) {
                try {
                        List<User> users = userRepository.findByRolesName(roleName);
                        for (User u : users) {
                                safeNotifyUser(u.getUserID(), message, type);
                        }
                } catch (Exception ignored) {
                }
        }

        private record ChargeBreakdown(double energyCharge,
                                                                   double fixedCharge,
                                                                   double duty,
                                                                   double tax,
                                                                   double subsidy,
                                                                   double totalAmount) {
        }
}
