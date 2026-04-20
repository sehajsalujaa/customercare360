//Manages billing cycles (open, close, generate bills).

package com.cts.service;

import com.cts.dto.BillingCycleResponseDto;
import com.cts.dto.CreateBillingCycleDto;
import com.cts.entity.BillingCycle;

import java.util.List;

public interface BillingCycleService {
    void createBillingCycle(CreateBillingCycleDto dto);
    String generateBills(Long cycleId);
    void closeBillingCycle(Long cycleId);

    List<BillingCycleResponseDto> getAllCycles();
}
