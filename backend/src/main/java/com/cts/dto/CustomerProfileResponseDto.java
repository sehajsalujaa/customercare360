package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileResponseDto {
    private Long customerId;
    private String name;
    private String email;
    private String phone;
    private String customerStatus;
    private String address;
    private String customerType;

    private List<ServiceAccountProfileDto> serviceAccounts;
    private List<BillDto> bills;
    private List<ServiceRequestDto> requests;
}
