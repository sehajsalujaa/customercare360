package com.cts.repository;

import com.cts.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository <Bill, Long> {
    List<Bill> findByServiceAccountAccountId(Long accountId);
    List<Bill> findByBillingCycleCycleId(Long cycleId);
    List<Bill> findByStatus(String status);
}
