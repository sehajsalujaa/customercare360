package com.cts.repository;

import com.cts.entity.ServiceAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceAccountRepository extends JpaRepository<ServiceAccount, Long> {
    List<ServiceAccount> findByCustomerCustomerId(Long customerId);
}
