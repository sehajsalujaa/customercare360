package com.cts.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "accountId")
    private ServiceAccount serviceAccount;

    @ManyToOne
    @JoinColumn(name = "premiseId")
    private Premise premise;

    private String orderType;
    private LocalDate scheduledDate;
    private LocalDate completionDate;
    private String status;
}
