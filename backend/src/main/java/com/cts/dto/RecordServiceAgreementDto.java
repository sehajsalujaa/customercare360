package com.cts.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RecordServiceAgreementDto {
    private Long serviceAccountId;
    private LocalDate termStartDate;
    private LocalDate termEndDate;
    private String tariffCode;
    private String specialNotes;
}