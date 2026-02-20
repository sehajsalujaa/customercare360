package com.cts.repository;

import com.cts.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByCustomerCustomerId(Long customerId);
    List<ServiceRequest> findByStatus(String status);
    List<ServiceRequest> findByPriority(String priority);
}
