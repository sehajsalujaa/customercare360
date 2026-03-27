package com.cts.serviceimpl;

import com.cts.dto.KpiThresholdDto;
import com.cts.entity.KpiThreshold;
import com.cts.repository.KpiThresholdRepository;
import com.cts.service.KpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KpiServiceImpl implements KpiService {
    private final KpiThresholdRepository kpiThresholdRepository;

    @Override
    public void saveThreshold(KpiThresholdDto dto) {
        KpiThreshold threshold = KpiThreshold.builder()
                .slaThreshold(dto.getSlaThreshold())
                .adjustmentThreshold(dto.getAdjustmentThreshold())
                .complaintThreshold(dto.getComplaintThreshold())
                .build();
        kpiThresholdRepository.save(threshold);
    }
}
