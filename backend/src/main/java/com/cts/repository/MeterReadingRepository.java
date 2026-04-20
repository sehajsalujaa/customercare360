package com.cts.repository;

import com.cts.entity.MeterReading;
import com.cts.enums.ReadingQualityFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    Optional<MeterReading> findTopByServiceAccountAccountIdAndReadingDateLessThanEqualAndQualityFlagOrderByReadingDateDesc(
            Long accountId,
            LocalDate readingDate,
            ReadingQualityFlag qualityFlag
    );

    Optional<MeterReading> findTopByServiceAccountAccountIdAndReadingDateLessThanAndQualityFlagOrderByReadingDateDesc(
            Long accountId,
            LocalDate readingDate,
            ReadingQualityFlag qualityFlag
    );

    List<MeterReading> findByQualityFlagOrderByReadingDateDesc(ReadingQualityFlag qualityFlag);
}
