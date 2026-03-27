package com.cts.controller;

import com.cts.dto.AssignServiceOrderDto;
import com.cts.dto.CreateServiceOrderDto;
import com.cts.dto.UpdateOrderStatusDto;
import com.cts.service.OrderService;
import com.cts.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/field")
@RequiredArgsConstructor
public class FieldCoordinatorController {
    private final OrderService orderService;

    @PostMapping("/service-order")
    public ResponseEntity<String> createServiceOrder(
            @RequestBody CreateServiceOrderDto dto){
        orderService.createServiceOrder(dto);
        return ResponseEntity.ok("Service order created successfully");
    }

    @PutMapping("/assign-order")
    public ResponseEntity<String> assignServiceOrder(
            @RequestBody AssignServiceOrderDto dto){
        orderService.assignServiceOrder(dto);
        return ResponseEntity.ok("Technician assigned successfully");
    }

    @PutMapping("/complete-order")
    public ResponseEntity<String> completeOrder(
            @RequestBody UpdateOrderStatusDto dto){
        orderService.updateOrderStatus(dto);
        return ResponseEntity.ok("Order status updated successfully");
    }
}