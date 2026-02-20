package com.cts.repository;

import com.cts.entity.Bill;
import com.cts.entity.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingCycleRepository extends JpaRepository <BillingCycle, Long> {
    List<Bill> findByServiceAccountAccountId(Long accountId);
    List<Bill> findByBillingCycleCycleId(Long cycleId);
    List<Bill> findByStatus(String status);
}
