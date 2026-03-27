package com.cts.controller;

import com.cts.dto.BillResponseDto;
import com.cts.dto.CreateBillingCycleDto;
import com.cts.dto.CreateDisputeDto;
import com.cts.dto.ResolveDisputeDto;
import com.cts.entity.Bill;
import com.cts.enums.BillStatus;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.service.BillService;
import com.cts.service.BillingCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {
    private final BillingCycleService billingCycleService;
    private final BillService billService;
    private final BillRepository billRepository;

    @PostMapping("/cycle")
    public ResponseEntity<String> createCycle(@RequestBody CreateBillingCycleDto dto){
        billingCycleService.createBillingCycle(dto);
        return ResponseEntity.ok("Billing cycle created successfully");
    }

    @PostMapping("/generate/{cycleId}")
    public ResponseEntity<String> generateBills(@PathVariable Long cycleId){
        return ResponseEntity.ok(billingCycleService.generateBills(cycleId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BillResponseDto>> getBills(@PathVariable Long customerId){
        return ResponseEntity.ok(billService.getBillsForCustomer(customerId));
    }

    @PutMapping("/close/{cycleId}")
    public ResponseEntity<String> closeCycle(@PathVariable Long cycleId) {
        billingCycleService.closeBillingCycle(cycleId);
        return ResponseEntity.ok("Billing cycle closed successfully");
    }

    @GetMapping("/exceptions")
    public ResponseEntity<List<Bill>> getFailedBills() {
        return ResponseEntity.ok(billService.getFailedBills());
    }

    @PostMapping("/retry/{billId}")
    public ResponseEntity<String> retryBill(@PathVariable Long billId) {
        // simple retry logic
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new CustomException("Bill not found"));
        bill.setBillStatus(BillStatus.GENERATED);
        bill.setErrorMessage(null);
        billRepository.save(bill);
        return ResponseEntity.ok("Bill retried successfully");
    }

    @PostMapping("/customer/dispute")
    public ResponseEntity<String> raiseDispute(@RequestBody CreateDisputeDto dto){
        billService.raiseDispute(dto);
        return ResponseEntity.ok("Dispute raised successfully");
    }

    @PostMapping("/dispute/resolve")
    public ResponseEntity<String> resolveDispute(@RequestBody ResolveDisputeDto dto){
        billService.resolveDispute(dto);
        return ResponseEntity.ok("Dispute resolved successfully");
    }
}
