package com.cts.entity;

import com.cts.enums.ServiceAccountStatus;
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
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    @ManyToOne
    @JoinColumn(name = "customerId")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;

    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    private ServiceAccountStatus serviceAccountStatus;

    @ManyToOne
    @JoinColumn(name="premiseId")
    private Premise premise;

}
