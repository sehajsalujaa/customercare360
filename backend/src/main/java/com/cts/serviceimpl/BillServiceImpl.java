package com.cts.serviceimpl;

import com.cts.dto.BillResponseDto;
import com.cts.dto.BillingDisputeResponseDto;
import com.cts.dto.CreateDisputeDto;
import com.cts.dto.ResolveDisputeDto;
import com.cts.entity.Bill;
import com.cts.entity.BillingDispute;
import com.cts.entity.User;
import com.cts.enums.BillStatus;
import com.cts.enums.BillDisputeStatus;
import com.cts.enums.NotificationType;
import com.cts.enums.ServiceType;
import com.cts.exception.CustomException;
import com.cts.repository.BillRepository;
import com.cts.repository.BillingDisputeRepository;
import com.cts.repository.UserRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.AuditService;
import com.cts.service.BillService;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {
    private final BillRepository billRepository;
    private final BillingDisputeRepository billingDisputeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final SecurityUtil securityUtil;

    private BillResponseDto mapToDto(Bill bill) {
        String customerName = "-";
        String email = "-";
        String connectionType = "-";
        Double amount = 0D;
        Double usage = 0D;
        
        try {
            if (bill.getServiceAccount() != null && bill.getServiceAccount().getCustomer() != null) {
                customerName = bill.getServiceAccount().getCustomer().getName();
                if (bill.getServiceAccount().getCustomer().getUser() != null) {
                    email = bill.getServiceAccount().getCustomer().getUser().getEmail();
                }
            }
            if (bill.getServiceAccount() != null && bill.getServiceAccount().getServiceType() != null) {
                connectionType = bill.getServiceAccount().getServiceType().name();
            }
            if (bill.getAmount() != null) {
                amount = bill.getAmount();
            }
            if (bill.getUsage() != null) {
                usage = bill.getUsage();
            }
        } catch (Exception e) {
            // Handle any issues with null traversal
        }
        
        return BillResponseDto.builder()
                .billId(bill.getBillId())
            .usage(usage)
                .amount(amount)
                .dueDate(bill.getDueDate())
                .billStatus(bill.getBillStatus() != null ? bill.getBillStatus().name() : "UNKNOWN")
                .customerName(customerName)
                .email(email)
                .connectionType(connectionType)
                .fromDate(bill.getFromDate())
                .toDate(bill.getToDate())
                .build();
    }

    @Override
    public List<BillResponseDto> getBillsForCustomer(Long customerId) {
        List<Bill> bills = billRepository.findByServiceAccountCustomerCustomerId(customerId);
        return bills.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<Bill> getFailedBills() {
        return billRepository.findByBillStatus(BillStatus.FAILED);
    }

    @Override
    public void raiseDispute(CreateDisputeDto dto) {
        Bill bill = billRepository.findById(dto.getBillId())
                .orElseThrow(() -> new CustomException("Bill not found"));

        if (bill.getBillStatus() == BillStatus.PAID || bill.getBillStatus() == BillStatus.CANCELLED) {
            throw new CustomException("Dispute cannot be raised for this bill status");
        }

        BillingDispute dispute = BillingDispute.builder()
                .bill(bill)
                .reason(dto.getReason())
                .billDisputeStatus(BillDisputeStatus.REQUESTED)
                .build();
        billingDisputeRepository.save(dispute);
        bill.setBillStatus(BillStatus.DISPUTED);
        billRepository.save(bill);
        Long userId = bill.getServiceAccount()
                .getCustomer()
                .getUser()
                .getUserID();
        auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "Dispute");
        notificationService.createNotification(
                userId,
                "Your dispute request has been submitted",
                NotificationType.BILL
        );
        notifyRoleUsers("ROLE_BILLING_ANALYST", "New billing dispute raised for bill #" + bill.getBillId() + ".", NotificationType.BILL);
        notifyRoleUsers("ROLE_ADMIN", "Billing dispute raised for bill #" + bill.getBillId() + ".", NotificationType.BILL);
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
            Bill bill = dispute.getBill();
            if (bill != null && bill.getBillStatus() == BillStatus.DISPUTED) {
                bill.setBillStatus(BillStatus.GENERATED);
                billRepository.save(bill);
            }
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
        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Dispute");
        notificationService.createNotification(
                userId,
                message,
                NotificationType.BILL
        );
        notifyRoleUsers("ROLE_ADMIN", "Dispute #" + dispute.getDisputeId() + " has been " + dto.getStatus().name().toLowerCase() + ".", NotificationType.BILL);
    }

    @Override
    public List<BillResponseDto> getAllBills() {
        return billRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<BillResponseDto> filterBills(String status, String connectionType, String fromDate, String toDate) {
        List<Bill> bills = billRepository.findAll();
        return bills.stream()
                .filter(b -> status == null ||
                        b.getBillStatus().name().equalsIgnoreCase(status))
                .filter(b -> connectionType == null ||
                        b.getServiceAccount().getServiceType().name().equalsIgnoreCase(connectionType))
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public void markBillAsPaid(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (bill.getBillStatus() == BillStatus.PAID) {
            return;
        }

        if (bill.getBillStatus() == BillStatus.CANCELLED) {
            throw new CustomException("Cancelled bill cannot be paid");
        }

        bill.setBillStatus(BillStatus.PAID);
        bill.setPaidAt(LocalDate.now());
        bill.setCollectedAmount(bill.getAmount());
        bill.setPaymentChannel("ONLINE");
        bill.setPaymentRef("SYS-" + bill.getBillId() + "-" + System.currentTimeMillis());
        billRepository.saveAndFlush(bill);

        Long customerUserId = bill.getServiceAccount() != null && bill.getServiceAccount().getCustomer() != null && bill.getServiceAccount().getCustomer().getUser() != null
            ? bill.getServiceAccount().getCustomer().getUser().getUserID()
            : null;
        safeNotifyUser(customerUserId, "Payment received for bill #" + bill.getBillId() + ".", NotificationType.BILL);
        notifyRoleUsers("ROLE_BILLING_ANALYST", "Bill #" + bill.getBillId() + " marked paid.", NotificationType.BILL);
    }

    @Override
    @Transactional
    public void markMyBillAsPaid(Long billId, Long currentUserId) {
        Bill bill = billRepository.findByBillIdAndServiceAccountCustomerUserUserID(billId, currentUserId)
                .orElseThrow(() -> new CustomException("Bill not found for current customer"));

        if (bill.getBillStatus() == BillStatus.PAID) {
            return;
        }

        if (bill.getBillStatus() == BillStatus.CANCELLED) {
            throw new CustomException("Cancelled bill cannot be paid");
        }

        bill.setBillStatus(BillStatus.PAID);
        bill.setPaidAt(LocalDate.now());
        bill.setCollectedAmount(bill.getAmount());
        bill.setPaymentChannel("ONLINE");
        bill.setPaymentRef("CUST-" + bill.getBillId() + "-" + System.currentTimeMillis());
        billRepository.saveAndFlush(bill);

        safeNotifyUser(currentUserId, "Your payment for bill #" + bill.getBillId() + " was successful.", NotificationType.BILL);
        notifyRoleUsers("ROLE_BILLING_ANALYST", "Customer payment received for bill #" + bill.getBillId() + ".", NotificationType.BILL);
    }

    @Override
    public Map<String, Object> getBillingSummary() {
        List<Bill> bills = billRepository.findAll();
        long total = bills.stream().filter(b -> b.getBillStatus() != BillStatus.FAILED).count();
        long paid = bills.stream().filter(b -> b.getBillStatus() == BillStatus.PAID).count();
        long overdue = bills.stream().filter(b ->
            b.getDueDate() != null
                && b.getDueDate().isBefore(LocalDate.now())
                && b.getBillStatus() != BillStatus.PAID
                && b.getBillStatus() != BillStatus.CANCELLED
                && b.getBillStatus() != BillStatus.FAILED
        ).count();
        long disputes = bills.stream().filter(b -> b.getBillStatus() == BillStatus.DISPUTED).count();
        long unpaid = Math.max(0, total - paid);
        double accuracy = total == 0 ? 0 : ((double) paid / total) * 100;
        double collectionEfficiency = total == 0 ? 0 : ((double) paid / total) * 100;
        Map<String, Object> map = new HashMap<>();
        map.put("totalBills", total);
        map.put("paidBills", paid);
        map.put("unpaidBills", unpaid);
        map.put("overdueBills", overdue);
        map.put("disputedBills", disputes);
        map.put("collectionEfficiency", collectionEfficiency);
        map.put("accuracy", accuracy);
        return map;
    }

    @Override
    public List<BillingDisputeResponseDto> getDisputes(String status) {
        List<BillingDispute> disputes;

        if (status == null || status.isBlank()) {
            disputes = billingDisputeRepository.findAllByOrderByDisputeIdDesc();
        } else {
            BillDisputeStatus parsedStatus;
            try {
                parsedStatus = BillDisputeStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new CustomException("Invalid dispute status: " + status);
            }
            disputes = billingDisputeRepository.findByBillDisputeStatusOrderByDisputeIdDesc(parsedStatus);
        }

        return disputes.stream()
                .map(d -> BillingDisputeResponseDto.builder()
                        .disputeId(d.getDisputeId())
                        .billId(d.getBill() != null ? d.getBill().getBillId() : null)
                        .customerName(d.getBill() != null && d.getBill().getServiceAccount() != null && d.getBill().getServiceAccount().getCustomer() != null
                                ? d.getBill().getServiceAccount().getCustomer().getName() : null)
                        .customerEmail(d.getBill() != null && d.getBill().getServiceAccount() != null && d.getBill().getServiceAccount().getCustomer() != null && d.getBill().getServiceAccount().getCustomer().getUser() != null
                                ? d.getBill().getServiceAccount().getCustomer().getUser().getEmail() : null)
                        .serviceType(d.getBill() != null && d.getBill().getServiceAccount() != null && d.getBill().getServiceAccount().getServiceType() != null
                                ? d.getBill().getServiceAccount().getServiceType().name() : null)
                        .dueDate(d.getBill() != null ? d.getBill().getDueDate() : null)
                        .currentBillAmount(d.getBill() != null ? d.getBill().getAmount() : null)
                        .reason(d.getReason())
                        .status(d.getBillDisputeStatus() != null ? d.getBillDisputeStatus().name() : null)
                        .approver(d.getApprover())
                        .amountDelta(d.getAmountDelta())
                        .decisionReason(d.getDecisionReason())
                        .build())
                .toList();
    }

    private void safeNotifyUser(Long userId, String message, NotificationType type) {
        try {
            if (userId != null) {
                notificationService.createNotification(userId, message, type);
            }
        } catch (Exception ignored) {
        }
    }

    private void notifyRoleUsers(String roleName, String message, NotificationType type) {
        try {
            List<User> users = userRepository.findByRolesName(roleName);
            for (User u : users) {
                safeNotifyUser(u.getUserID(), message, type);
            }
        } catch (Exception ignored) {
        }
    }
}
