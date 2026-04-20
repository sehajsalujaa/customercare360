package com.cts.entity;

import com.cts.enums.MeterReadingSource;
import com.cts.enums.ReadingQualityFlag;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(indexes = {
        @Index(name = "idx_reading_account_date", columnList = "account_id,readingDate")
})
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long readingId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id")
    private ServiceAccount serviceAccount;

    private LocalDate readingDate;

    /**
     * Cumulative meter counter value.
     * Billing usage is derived from delta between two readings.
     */
    private Double readingValue;

    @Enumerated(EnumType.STRING)
    private MeterReadingSource source;

    @Enumerated(EnumType.STRING)
    private ReadingQualityFlag qualityFlag;

    private Long validatedByUserId;
    private LocalDate validatedAt;
}
