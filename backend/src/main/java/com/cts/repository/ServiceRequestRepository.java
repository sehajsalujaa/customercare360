package com.cts.repository;

import com.cts.entity.ServiceRequest;
import com.cts.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    Page<ServiceRequest> findByCustomerCustomerId(Long customerId, Pageable pageable);
    long countByStatus(RequestStatus status);
    List<ServiceRequest> findByStatus(RequestStatus status);
    List<ServiceRequest> findAllByOrderByCreatedDateDesc(Pageable pageable);
}
