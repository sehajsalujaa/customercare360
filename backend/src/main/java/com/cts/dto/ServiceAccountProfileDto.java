package com.cts.dto;

import com.cts.enums.ServiceAccountStatus;
import com.cts.enums.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAccountProfileDto {
    private Long accountId;
    private ServiceType serviceType;
    private ServiceAccountStatus serviceAccountStatus;
    private String address;
    private String region;
    private String meterId;
}
