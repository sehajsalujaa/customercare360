//Retrieves bills by account or billing cycle.

package com.cts.service;

import com.cts.dto.BillResponseDto;
import com.cts.dto.CreateDisputeDto;
import com.cts.dto.ResolveDisputeDto;
import com.cts.entity.Bill;

import java.util.List;

public interface BillService {
    List<BillResponseDto> getBillsForCustomer(Long customerId);
    List<Bill> getFailedBills();
    void raiseDispute(CreateDisputeDto dto);
    void resolveDispute(ResolveDisputeDto dto);
}
