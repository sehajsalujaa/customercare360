//Manages billing adjustments (late fee waivers, corrections).

package com.cts.service;

import com.cts.dto.AdjustmentDto;
import com.cts.entity.Adjustment;

import java.util.List;

public interface AdjustmentService {
    Adjustment createAdjustment(AdjustmentDto dto);
    List<Adjustment> getAdjustmentsByBill(Long billId);
}
