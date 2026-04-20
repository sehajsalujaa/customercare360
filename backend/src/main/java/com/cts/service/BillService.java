//Retrieves bills by account or billing cycle.

package com.cts.service;

import com.cts.dto.BillResponseDto;
import com.cts.dto.BillingDisputeResponseDto;
import com.cts.dto.CreateDisputeDto;
import com.cts.dto.ResolveDisputeDto;
import com.cts.entity.Bill;
import org.jspecify.annotations.Nullable;

import java.util.List;
import java.util.Map;
import java.util.Objects;

public interface BillService {
    List<BillResponseDto> getBillsForCustomer(Long customerId);
    List<Bill> getFailedBills();
    void raiseDispute(CreateDisputeDto dto);
    void resolveDispute(ResolveDisputeDto dto);
    List<BillResponseDto> getAllBills();
    List<BillResponseDto> filterBills(String billStatus, String connectionType, String fromDate, String toDate);
    void markBillAsPaid(Long billId);
    void markMyBillAsPaid(Long billId, Long currentUserId);
    @Nullable Map<String, Object> getBillingSummary();

    List<BillingDisputeResponseDto> getDisputes(String status);
}
