package com.cts.service;

import com.cts.dto.AssignServiceOrderDto;
import com.cts.dto.CreateServiceOrderDto;
import com.cts.dto.UpdateOrderStatusDto;

public interface OrderService {
    void createServiceOrder(CreateServiceOrderDto dto);
    void assignServiceOrder(AssignServiceOrderDto dto);
    void updateOrderStatus(UpdateOrderStatusDto dto);
}
