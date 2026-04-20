package com.cts.repository;

import com.cts.entity.Bill;
import com.cts.entity.BillingCycle;
import com.cts.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface BillingCycleRepository extends JpaRepository <BillingCycle, Long> {
    boolean existsByServiceTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            ServiceType serviceType,
            LocalDate endDate,
            LocalDate startDate
    );

    java.util.List<BillingCycle> findAllByOrderByStartDateDesc();
}
