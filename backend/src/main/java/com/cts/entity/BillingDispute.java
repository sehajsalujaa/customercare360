package com.cts.entity;

import com.cts.enums.BillDisputeStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class BillingDispute {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long disputeId;

    @ManyToOne
    @JoinColumn(name = "billId")
    private Bill bill;

    private String reason;

    @Enumerated(EnumType.STRING)
    private BillDisputeStatus billDisputeStatus;

    private String approver;
    private Double amountDelta;
    private String decisionReason;
}
