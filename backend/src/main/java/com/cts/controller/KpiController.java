package com.cts.controller;

import com.cts.dto.KpiThresholdDto;
import com.cts.service.KpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kpi")
@RequiredArgsConstructor
public class KpiController {
    private final KpiService kpiService;

    @PostMapping("/threshold")
    public String saveThreshold(@RequestBody KpiThresholdDto dto) {
        kpiService.saveThreshold(dto);
        return "KPI thresholds saved successfully";
    }
}