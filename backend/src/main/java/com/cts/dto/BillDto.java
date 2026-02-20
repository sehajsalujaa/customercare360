package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillDto {
    private Long accountId;
    private Long cycleId;
    private Double usage;
    private Double amount;
    private LocalDate dueDate;
    private String status;
}
