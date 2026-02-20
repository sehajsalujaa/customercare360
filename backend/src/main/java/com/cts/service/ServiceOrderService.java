//Manages field service orders (connect, disconnect, inspection).

package com.cts.service;

import com.cts.entity.ServiceOrder;

import java.util.List;

public interface ServiceOrderService {
    ServiceOrder createOrder(ServiceOrder order);
    ServiceOrder updateOrderStatus(Long orderId, String status);
    List<ServiceOrder> getOrdersByAccount(Long accountId);
    List<ServiceOrder> getOrdersByPremise(Long premiseId);
}
