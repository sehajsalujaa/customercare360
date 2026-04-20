package com.cts.repository;

import com.cts.entity.ServiceOrder;
import com.cts.entity.ServiceRequest;
import com.cts.enums.ServiceOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository <ServiceOrder, Long> {
    ServiceOrder findByServiceRequest(ServiceRequest request);
    List<ServiceOrder> findAllByOrderByOrderIdDesc();
    List<ServiceOrder> findByServiceOrderStatusOrderByOrderIdDesc(ServiceOrderStatus status);
}
