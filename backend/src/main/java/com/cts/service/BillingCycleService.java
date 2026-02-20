//Manages billing cycles (open, close, generate bills).

package com.cts.service;

import com.cts.entity.BillingCycle;

import java.util.List;

public interface BillingCycleService {
    BillingCycle createCycle(BillingCycle cycle);
    BillingCycle getCycleById(Long cycleId);
    List<BillingCycle> getAllCycles();
}
