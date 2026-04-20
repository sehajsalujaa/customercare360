package com.cts.job;

import com.cts.entity.Bill;
import com.cts.enums.BillGenerationSource;
import com.cts.enums.BillStatus;
import com.cts.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillingReconciliationJob {

    private final BillRepository billRepository;

    /**
     * Daily reconciliation:
     * 1) mark overdue bills based on due date
     * 2) backfill legacy source for old rows
     */
    @Scheduled(cron = "0 30 2 * * *")
    public void reconcileBills() {
        List<Bill> bills = billRepository.findAll();
        boolean changed = false;
        LocalDate today = LocalDate.now();

        for (Bill bill : bills) {
            if (bill.getGenerationSource() == null) {
                bill.setGenerationSource(BillGenerationSource.LEGACY);
                changed = true;
            }

            if ((bill.getBillStatus() == BillStatus.GENERATED || bill.getBillStatus() == BillStatus.SENT)
                    && bill.getDueDate() != null
                    && bill.getDueDate().isBefore(today)) {
                bill.setBillStatus(BillStatus.OVERDUE);
                changed = true;
            }
        }

        if (changed) {
            billRepository.saveAll(bills);
            log.info("Billing reconciliation applied for {} bills", bills.size());
        }
    }
}
