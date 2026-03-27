package com.cts.serviceimpl;

import com.cts.dto.CreateBillingCycleDto;
import com.cts.entity.Bill;
import com.cts.entity.BillingCycle;
import com.cts.entity.ServiceAccount;
import com.cts.enums.BillStatus;
import com.cts.enums.BillingCycleStatus;
import com.cts.enums.NotificationType;
import com.cts.enums.ServiceAccountStatus;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.repository.BillingCycleRepository;
import com.cts.repository.ServiceAccountRepository;
import com.cts.service.BillingCycleService;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingCycleServiceImpl implements BillingCycleService {
    private final BillingCycleRepository billingCycleRepository;
    private final ServiceAccountRepository serviceAccountRepository;
    private final BillRepository billRepository;
    private final NotificationService notificationService;

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
    }

    @Override
    public String generateBills(Long cycleId) {
        BillingCycle cycle = billingCycleRepository.findById(cycleId)
                .orElseThrow(() -> new CustomException("Cycle not found"));
        List<ServiceAccount> accounts =
                serviceAccountRepository.findByServiceAccountStatus(ServiceAccountStatus.ACTIVE);
        int success = 0;
        int failed = 0;
        for(ServiceAccount account : accounts){
            try {
                Bill bill = Bill.builder()
                        .serviceAccount(account)
                        .billingCycle(cycle)
                        .usage(Math.random() * 100)   // dummy
                        .amount(Math.random() * 500)  // dummy
                        .dueDate(cycle.getBillDate().plusDays(15))
                        .billStatus(BillStatus.GENERATED)
                        .build();
                billRepository.save(bill);
                Long userId = account.getCustomer()
                        .getUser()
                        .getUserID();
                notificationService.createNotification(
                        userId,
                        "Your bill has been generated",
                        NotificationType.BILL
                );
                success++;
            } catch (Exception e){
                Bill failedBill = Bill.builder()
                        .serviceAccount(account)
                        .billingCycle(cycle)
                        .billStatus(BillStatus.FAILED)
                        .errorMessage(e.getMessage())
                        .build();
                billRepository.save(failedBill);
                failed++;
            }
        }
        return "Bills generated: " + success + ", Failed: " + failed;
    }

    @Override
    public void closeBillingCycle(Long cycleId) {
        BillingCycle cycle = billingCycleRepository.findById(cycleId)
                .orElseThrow(() -> new CustomException("Cycle not found"));
        List<Bill> bills = billRepository.findByBillingCycleCycleId(cycleId);
        boolean allProcessed = bills.stream().allMatch(bill ->
                bill.getBillStatus() == BillStatus.GENERATED ||
                        bill.getBillStatus() == BillStatus.PAID ||
                        bill.getBillStatus() == BillStatus.ADJUSTED
        );
        if (!allProcessed) {
            throw new CustomException("All bills must be processed before closing cycle");
        }
        cycle.setBillingCycleStatus(BillingCycleStatus.COMPLETED);
        billingCycleRepository.save(cycle);
    }
}
