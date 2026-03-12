package com.cts.controller;

import com.cts.dto.CreateAgentRequestDto;
import com.cts.dto.DeactivateCustomerDto;
import com.cts.service.CustomerService;
import com.cts.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final CustomerService customerService;

    @PostMapping("/create-agent")
    public String createAgent(
            @Valid @RequestBody CreateAgentRequestDto request) {
        userService.createAgent(request);
        return "Agent created successfully";
    }

    @PutMapping("/customers/{customerId}/approve")
    public String approveCustomer(@PathVariable Long customerId){
        customerService.approveCustomer(customerId);
        return "Customer approved successfully";
    }

    @PutMapping("/customers/{customerId}/deactivate")
    public String deactivateCustomer(
            @PathVariable Long customerId,
            @RequestBody DeactivateCustomerDto dto){
        customerService.deactivateCustomer(customerId, dto.getReason());
        return "Customer deactivated successfully";
    }

    @PutMapping("/customers/{customerId}/reactivate")
    public String reactivateCustomer(
            @PathVariable Long customerId){
        customerService.reactivateCustomer(customerId);
        return "Customer reactivated successfully";
    }
}
