package com.cts.dto;

import lombok.Data;

@Data
public class TariffSlabDto {
    private Double startUnit;
    private Double endUnit;
    private Double ratePerUnit;
}
