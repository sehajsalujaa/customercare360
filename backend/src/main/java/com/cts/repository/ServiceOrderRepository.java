package com.cts.repository;

import com.cts.entity.ServiceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository <ServiceOrder, Long> {
    List<ServiceOrder> findByServiceAccountAccountId(Long accountId);
    List<ServiceOrder> findByPremisePremiseId(Long premiseId);
    List<ServiceOrder> findByStatus(String status);
}
