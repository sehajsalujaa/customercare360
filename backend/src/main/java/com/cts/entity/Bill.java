package com.cts.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billID;

    @ManyToOne
    @JoinColumn(name = "accountId")
    private ServiceAccount serviceAccount;

    @ManyToOne
    @JoinColumn(name = "cycleId")
    private BillingCycle billingCycle;

    @Column(name = "usage_amount")
    private Double usage;
    private Double amount;
    private LocalDate dueDate;
    private String status;

}
