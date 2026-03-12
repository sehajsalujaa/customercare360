package com.cts.dto;

import com.cts.enums.RequestType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceRequestDto {
    private Long customerId;
    private RequestType requestType;
}
