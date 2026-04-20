package com.cts.dto;

import com.cts.enums.MeterReadingSource;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MeterReadingUpsertDto {
    private Long serviceAccountId;
    private LocalDate readingDate;
    private Double readingValue;
    private MeterReadingSource source;
}
