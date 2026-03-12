package com.cts.dto;

import lombok.Data;

@Data
public class LinkPremiseDto {
    private Long serviceAccountId;
    private String address;
    private String region;
    private String meterId;
}
