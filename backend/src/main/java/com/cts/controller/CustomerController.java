package com.cts.controller;

import com.cts.dto.CreateServiceRequestDto;
import com.cts.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    @PostMapping("/service-request")
    public ResponseEntity<String> raiseServiceRequest(
            @RequestBody CreateServiceRequestDto dto){
        customerService.createServiceRequest(dto);
        return ResponseEntity.ok("Service request created successfully");
    }
}
