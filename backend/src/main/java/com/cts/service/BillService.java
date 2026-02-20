//Retrieves bills by account or billing cycle.

package com.cts.service;

import com.cts.entity.Bill;

import java.util.List;

public interface BillService {
    List<Bill> getBillsByAccount(Long accountId);
    List<Bill> getBillsByCycle(Long cycleId);
}
