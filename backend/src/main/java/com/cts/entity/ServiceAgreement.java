package com.cts.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long agreementId;

    @OneToOne
    @JoinColumn(name = "service_account_id")
    private ServiceAccount serviceAccount;

    private LocalDate termStartDate;
    private LocalDate termEndDate;
    private String tariffCode;
    private String specialNotes;
}