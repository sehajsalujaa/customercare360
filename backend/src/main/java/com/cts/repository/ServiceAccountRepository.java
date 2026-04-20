package com.cts.repository;

import com.cts.entity.ServiceAccount;
import com.cts.enums.ServiceAccountStatus;
import com.cts.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceAccountRepository extends JpaRepository<ServiceAccount, Long> {
    List<ServiceAccount> findByCustomerCustomerId(Long customerId);
    List<ServiceAccount> findByServiceAccountStatus(ServiceAccountStatus serviceAccountStatus);
    boolean existsByPremisePremiseIdAndServiceTypeAndServiceAccountStatus(Long premiseId, ServiceType serviceType, ServiceAccountStatus serviceAccountStatus);
    List<ServiceAccount> findByServiceAccountStatusAndServiceType(ServiceAccountStatus serviceAccountStatus, ServiceType serviceType);
}
