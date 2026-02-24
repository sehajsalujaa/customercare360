package com.cts.repository;

import com.cts.entity.Bill;
import com.cts.entity.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingCycleRepository extends JpaRepository <BillingCycle, Long> {
    List<BillingCycle> findByCycleId(Long cycleId);
    List<BillingCycle> findByServiceType(String serviceType);
    List<BillingCycle> findByStatus(String status);

}
