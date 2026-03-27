package com.cts.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long kpiId;

    private double slaThreshold;
    private double adjustmentThreshold;
    private int complaintThreshold;
}
