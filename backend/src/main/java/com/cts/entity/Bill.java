package com.cts.entity;

import com.cts.enums.BillStatus;
import com.cts.enums.BillGenerationSource;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_bill_cycle_account", columnNames = {"cycleId", "accountId"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;

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

    @Enumerated(EnumType.STRING)
    private BillStatus billStatus;

    private String errorMessage;

    private LocalDate fromDate;
    private LocalDate toDate;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String billBreakdown;

    @Enumerated(EnumType.STRING)
    private BillGenerationSource generationSource;

    private LocalDate paidAt;
    private String paymentRef;
    private String paymentChannel;
    private Double collectedAmount;

    @Version
    private Long version;

}
