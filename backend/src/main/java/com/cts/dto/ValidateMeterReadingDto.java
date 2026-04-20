package com.cts.dto;

import com.cts.enums.ReadingQualityFlag;
import lombok.Data;

@Data
public class ValidateMeterReadingDto {
    private ReadingQualityFlag qualityFlag;
}
