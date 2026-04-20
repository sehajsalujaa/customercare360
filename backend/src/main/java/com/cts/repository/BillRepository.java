package com.cts.repository;

import com.cts.entity.Bill;
import com.cts.enums.BillStatus;
import com.cts.enums.ServiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByServiceAccountCustomerCustomerId(Long customerId);
    List<Bill> findByBillingCycleCycleId(Long cycleId);
       Optional<Bill> findByBillingCycleCycleIdAndServiceAccountAccountId(Long cycleId, Long accountId);
    List<Bill> findByBillStatus(BillStatus status);
    long countByBillStatus(BillStatus billStatus);
    Page<Bill> findByServiceAccountCustomerCustomerId(Long customerId, Pageable pageable);
       Optional<Bill> findByBillIdAndServiceAccountCustomerUserUserID(Long billId, Long userId);

    @Query("SELECT YEAR(b.dueDate), MONTH(b.dueDate), COUNT(b) FROM Bill b WHERE b.dueDate IS NOT NULL GROUP BY YEAR(b.dueDate), MONTH(b.dueDate) ORDER BY YEAR(b.dueDate), MONTH(b.dueDate)")
    List<Object[]> countBillsByMonth();

    @Query("SELECT COUNT(b) FROM Bill b WHERE " +
           "(:serviceType IS NULL OR b.billingCycle.serviceType = :serviceType) AND " +
           "(:startDate IS NULL OR b.dueDate >= :startDate) AND " +
           "(:endDate IS NULL OR b.dueDate <= :endDate)")
    long countFiltered(@Param("serviceType") ServiceType serviceType,
                       @Param("startDate") LocalDate startDate,
                       @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.billStatus = :status AND " +
           "(:serviceType IS NULL OR b.billingCycle.serviceType = :serviceType) AND " +
           "(:startDate IS NULL OR b.dueDate >= :startDate) AND " +
           "(:endDate IS NULL OR b.dueDate <= :endDate)")
    long countFilteredByStatus(@Param("status") BillStatus status,
                               @Param("serviceType") ServiceType serviceType,
                               @Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate);

    @Query("SELECT YEAR(b.dueDate), MONTH(b.dueDate), COUNT(b) FROM Bill b WHERE b.dueDate IS NOT NULL AND " +
           "(:serviceType IS NULL OR b.billingCycle.serviceType = :serviceType) AND " +
           "(:startDate IS NULL OR b.dueDate >= :startDate) AND " +
           "(:endDate IS NULL OR b.dueDate <= :endDate) " +
           "GROUP BY YEAR(b.dueDate), MONTH(b.dueDate) ORDER BY YEAR(b.dueDate), MONTH(b.dueDate)")
    List<Object[]> countBillsByMonthFiltered(@Param("serviceType") ServiceType serviceType,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);
}
