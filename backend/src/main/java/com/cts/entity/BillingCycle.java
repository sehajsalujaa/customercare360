package com.cts.entity;

import com.cts.enums.BillingCycleStatus;
import com.cts.enums.ServiceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cycleId;

    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate billDate;

    @Enumerated(EnumType.STRING)
    private BillingCycleStatus billingCycleStatus;

}
