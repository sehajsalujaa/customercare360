package com.cts.repository;

import com.cts.entity.ServiceAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceAgreementRepository
        extends JpaRepository<ServiceAgreement, Long> {}