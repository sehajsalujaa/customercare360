package com.cts.controller;

import com.cts.dto.CreateServiceRequestDto;
import com.cts.dto.RequestStatusResponseDto;
import com.cts.service.CustomerService;
import com.cts.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    private final RequestService requestService;

    @PostMapping("/service-request")
    public ResponseEntity<String> raiseServiceRequest(
            @RequestBody CreateServiceRequestDto dto){
        customerService.createServiceRequest(dto);
        return ResponseEntity.ok("Service request created successfully");
    }

    @GetMapping("/request-status/{requestId}")
    public ResponseEntity<RequestStatusResponseDto> getRequestStatus(
            @PathVariable Long requestId){
        return ResponseEntity.ok(
                requestService.getRequestStatus(requestId)
        );
    }
}
