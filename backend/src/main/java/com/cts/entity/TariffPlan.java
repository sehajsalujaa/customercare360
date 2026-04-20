package com.cts.entity;

import com.cts.enums.CustomerType;
import com.cts.enums.ServiceType;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(indexes = {
        @Index(name = "idx_tariff_lookup", columnList = "serviceType,customerType,region,active")
})
public class TariffPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tariffPlanId;

    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    private CustomerType customerType;

    private String region;

    private Double fixedCharge;
    private Double taxPercent;
    private Double dutyPercent;
    private Double subsidyAmount;
    private String lateFeeRule;

    private boolean active;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    @OneToMany(mappedBy = "tariffPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<TariffSlab> slabs = new ArrayList<>();
}
