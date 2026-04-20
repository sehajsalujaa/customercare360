package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillResponseDto {
    private Long billId;
    private double usage;
    private double amount;
    private LocalDate dueDate;
    private String billStatus;
    private String customerName;
    private String email;
    private String connectionType;
    private LocalDate fromDate;
    private LocalDate toDate;
}
