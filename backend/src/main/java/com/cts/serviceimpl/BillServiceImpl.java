package com.cts.serviceimpl;

import com.cts.dto.BillResponseDto;
import com.cts.dto.CreateDisputeDto;
import com.cts.dto.ResolveDisputeDto;
import com.cts.entity.Bill;
import com.cts.entity.BillingDispute;
import com.cts.enums.BillStatus;
import com.cts.enums.BillDisputeStatus;
import com.cts.enums.NotificationType;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.repository.BillingDisputeRepository;
import com.cts.service.BillService;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {
    private final BillRepository billRepository;
    private final BillingDisputeRepository billingDisputeRepository;
    private final NotificationService notificationService;

    @Override
    public List<BillResponseDto> getBillsForCustomer(Long customerId) {
        List<Bill> bills = billRepository.findByServiceAccountCustomerCustomerId(customerId);
        return bills.stream().map(bill ->
                new BillResponseDto(
                        bill.getBillId(),
                        bill.getUsage(),
                        bill.getAmount(),
                        bill.getDueDate(),
                        bill.getBillStatus().name()
                )
        ).toList();
    }

    @Override
    public List<Bill> getFailedBills() {
        return billRepository.findByBillStatus(BillStatus.FAILED);
    }

    @Override
    public void raiseDispute(CreateDisputeDto dto) {
        Bill bill = billRepository.findById(dto.getBillId())
                .orElseThrow(() -> new CustomException("Bill not found"));
        BillingDispute dispute = BillingDispute.builder()
                .bill(bill)
                .reason(dto.getReason())
                .billDisputeStatus(BillDisputeStatus.REQUESTED)
                .build();
        billingDisputeRepository.save(dispute);
        Long userId = bill.getServiceAccount()
                .getCustomer()
                .getUser()
                .getUserID();
        notificationService.createNotification(
                userId,
                "Your dispute request has been submitted",
                NotificationType.BILL
        );
    }

    @Override
    public void resolveDispute(ResolveDisputeDto dto) {
        BillingDispute dispute = billingDisputeRepository.findById(dto.getDisputeId())
                .orElseThrow(() -> new CustomException("Dispute not found"));
        if(dispute.getBillDisputeStatus() != BillDisputeStatus.REQUESTED){
            throw new CustomException("Dispute already processed");
        }
        if(dto.getStatus() == BillDisputeStatus.APPROVED){
            if(dto.getAmountDelta() == null){
                throw new CustomException("Amount delta required for approval");
            }
            Bill bill = dispute.getBill();
            // update bill amount
            bill.setAmount(bill.getAmount() + dto.getAmountDelta());
            bill.setBillStatus(BillStatus.ADJUSTED);
            billRepository.save(bill);
            dispute.setBillDisputeStatus(BillDisputeStatus.APPROVED);
            dispute.setAmountDelta(dto.getAmountDelta());
        } else if(dto.getStatus()== BillDisputeStatus.REJECTED){
            dispute.setBillDisputeStatus(BillDisputeStatus.REJECTED);
        } else {
            throw new CustomException("Invalid status");
        }
        dispute.setApprover(dto.getApprover());
        dispute.setDecisionReason(dto.getDecisionReason());
        billingDisputeRepository.save(dispute);
        Long userId = dispute.getBill()
                .getServiceAccount()
                .getCustomer()
                .getUser()
                .getUserID();
        String message = dto.getStatus() == BillDisputeStatus.APPROVED
                ? "Your dispute has been approved"
                : "Your dispute has been rejected";
        notificationService.createNotification(
                userId,
                message,
                NotificationType.BILL
        );
    }
}
