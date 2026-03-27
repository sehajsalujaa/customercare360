package com.cts.entity;

import com.cts.enums.OrderType;
import com.cts.enums.ServiceOrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "serviceAccountId")
    private ServiceAccount serviceAccount;

    @ManyToOne
    @JoinColumn(name = "premiseId")
    private Premise premise;

    @Enumerated(EnumType.STRING)
    private OrderType orderType;

    private LocalDate scheduledDate;
    private LocalDate completionDate;

    @Enumerated(EnumType.STRING)
    private ServiceOrderStatus serviceOrderStatus;

    private String technicianName;
    private String reassignmentLog;
    private String failureReason;

    @ManyToOne
    @JoinColumn(name="request_id")
    private ServiceRequest serviceRequest;
}
