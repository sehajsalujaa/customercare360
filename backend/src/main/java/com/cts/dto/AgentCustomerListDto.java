package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentCustomerListDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String status;
}
