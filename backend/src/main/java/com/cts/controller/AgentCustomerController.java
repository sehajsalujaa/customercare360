package com.cts.controller;

import com.cts.dto.*;
import com.cts.service.CustomerService;
import com.cts.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentCustomerController {
    private final UserService userService;
    private final CustomerService customerService;

    @PostMapping("/create-customer")
    public ResponseEntity<String> createCustomerProfile(
            @Valid
            @RequestBody CreateCustomerDto dto) {
        userService.createCustomerByAgent(dto);
        return ResponseEntity.ok("Customer profile created and pending approval");
    }

    @PutMapping("/customers/{customerId}/contact")
    public ResponseEntity<String> updateCustomerContact(
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateCustomerContactDto dto
    ) {
        customerService.updateCustomerContact(customerId, dto);
        return ResponseEntity.ok("Customer contact updated successfully");
    }

    @PostMapping("/service-accounts")
    public ResponseEntity<String> createServiceAccount(
            @RequestBody CreateServiceAccountDto dto
    ){
        customerService.createServiceAccount(dto);
        return ResponseEntity.ok("Service account created successfully");
    }

    @PostMapping("/link-premise")
    public ResponseEntity<String> linkPremise(
            @RequestBody LinkPremiseDto dto){
        customerService.linkPremise(dto);
        return ResponseEntity.ok("Premise linked successfully");
    }

    @GetMapping("/customers/{customerId}/profile")
    public ResponseEntity<CustomerProfileResponseDto> getCustomerProfile(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getCustomerProfile(customerId));
    }
}
