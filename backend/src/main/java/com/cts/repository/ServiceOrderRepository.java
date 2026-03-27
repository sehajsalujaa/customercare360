package com.cts.repository;

import com.cts.entity.ServiceOrder;
import com.cts.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository <ServiceOrder, Long> {
    ServiceOrder findByServiceRequest(ServiceRequest request);
}
