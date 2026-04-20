package com.cts.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TariffSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slabId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tariff_plan_id")
    @JsonBackReference
    @JsonIgnore
    private TariffPlan tariffPlan;

    private Double startUnit;
    private Double endUnit;
    private Double ratePerUnit;
}
