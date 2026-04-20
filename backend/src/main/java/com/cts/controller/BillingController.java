package com.cts.controller;

import com.cts.dto.BillResponseDto;
import com.cts.dto.BillingCycleResponseDto;
import com.cts.dto.BillingDisputeResponseDto;
import com.cts.dto.CreateTariffPlanDto;
import com.cts.dto.CreateBillingCycleDto;
import com.cts.dto.CreateDisputeDto;
import com.cts.dto.ResolveDisputeDto;
import com.cts.entity.Bill;
import com.cts.entity.TariffPlan;
import com.cts.entity.TariffSlab;
import com.cts.enums.BillStatus;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.repository.TariffPlanRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.BillService;
import com.cts.service.BillingCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {
    private final BillingCycleService billingCycleService;
    private final BillService billService;
    private final BillRepository billRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final SecurityUtil securityUtil;

    @PostMapping("/cycle")
    public ResponseEntity<String> createCycle(@RequestBody CreateBillingCycleDto dto){
        billingCycleService.createBillingCycle(dto);
        return ResponseEntity.ok("Billing cycle created successfully");
    }

    @PostMapping("/generate/{cycleId}")
    public ResponseEntity<String> generateBills(@PathVariable Long cycleId){
        try {
            String result = billingCycleService.generateBills(cycleId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error generating bills for cycle " + cycleId + ": " + e.getMessage());
            throw new CustomException("Bill generation failed: " + e.getMessage());
        }
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

    @GetMapping("/all")
    public ResponseEntity<List<BillResponseDto>> getAllBills() {
        try {
            return ResponseEntity.ok(billService.getAllBills());
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error in getAllBills: " + e.getMessage());
            throw new CustomException("Error fetching bills: " + e.getMessage());
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<List<BillResponseDto>> filterBills(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String connectionType,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate
    ) {
        return ResponseEntity.ok(
                billService.filterBills(status, connectionType, fromDate, toDate)
        );
    }

    @PutMapping("/pay/{billId}")
    public ResponseEntity<String> markAsPaid(@PathVariable Long billId) {
        billService.markBillAsPaid(billId);
        return ResponseEntity.ok("Bill marked as PAID");
    }

    @PutMapping("/customer/pay/{billId}")
    public ResponseEntity<String> markMyBillAsPaid(@PathVariable Long billId) {
        billService.markMyBillAsPaid(billId, securityUtil.getCurrentUserId());
        return ResponseEntity.ok("Bill marked as PAID");
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(billService.getBillingSummary());
    }

    @GetMapping("/cycles")
    public ResponseEntity<List<BillingCycleResponseDto>> getCycles() {
        try {
            return ResponseEntity.ok(billingCycleService.getAllCycles());
        } catch (Exception ex) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/disputes")
    public ResponseEntity<List<BillingDisputeResponseDto>> getDisputes(
            @RequestParam(required = false) String status
    ) {
        try {
            return ResponseEntity.ok(billService.getDisputes(status));
        } catch (Exception ex) {
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/tariff-plans")
    public ResponseEntity<String> createTariffPlan(@RequestBody CreateTariffPlanDto dto) {
        TariffPlan plan = TariffPlan.builder()
                .serviceType(dto.getServiceType())
                .customerType(dto.getCustomerType())
                .region(dto.getRegion())
                .fixedCharge(dto.getFixedCharge())
                .taxPercent(dto.getTaxPercent())
                .dutyPercent(dto.getDutyPercent())
                .subsidyAmount(dto.getSubsidyAmount())
                .lateFeeRule(dto.getLateFeeRule())
                .effectiveFrom(dto.getEffectiveFrom())
                .effectiveTo(dto.getEffectiveTo())
                .active(true)
                .build();

        if (dto.getSlabs() != null) {
            List<TariffSlab> slabs = dto.getSlabs().stream().map(s -> TariffSlab.builder()
                    .tariffPlan(plan)
                    .startUnit(s.getStartUnit())
                    .endUnit(s.getEndUnit())
                    .ratePerUnit(s.getRatePerUnit())
                    .build()).toList();
            plan.getSlabs().addAll(slabs);
        }

        tariffPlanRepository.save(plan);
        return ResponseEntity.ok("Tariff plan created successfully");
    }

    @GetMapping("/tariff-plans")
    public ResponseEntity<List<TariffPlan>> getTariffPlans() {
        return ResponseEntity.ok(tariffPlanRepository.findByActiveTrueOrderByEffectiveFromDesc());
    }
}
