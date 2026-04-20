package com.cts.repository;

import com.cts.entity.TariffPlan;
import com.cts.enums.CustomerType;
import com.cts.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TariffPlanRepository extends JpaRepository<TariffPlan, Long> {
    List<TariffPlan> findByActiveTrueOrderByEffectiveFromDesc();

    Optional<TariffPlan> findFirstByActiveTrueAndServiceTypeAndCustomerTypeAndRegionAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrderByEffectiveFromDesc(
            ServiceType serviceType,
            CustomerType customerType,
            String region,
            LocalDate fromDate,
            LocalDate toDate
    );

    Optional<TariffPlan> findFirstByActiveTrueAndServiceTypeAndCustomerTypeAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrderByEffectiveFromDesc(
            ServiceType serviceType,
            CustomerType customerType,
            LocalDate fromDate,
            LocalDate toDate
    );
}
