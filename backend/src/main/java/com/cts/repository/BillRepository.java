package com.cts.repository;

import com.cts.entity.Bill;
import com.cts.enums.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository <Bill, Long> {
    List<Bill> findByServiceAccountCustomerCustomerId(Long customerId);
    List<Bill> findByBillingCycleCycleId(Long cycleId);
    List<Bill> findByBillStatus(BillStatus status);
    long countByBillStatus(BillStatus billStatus);
}
