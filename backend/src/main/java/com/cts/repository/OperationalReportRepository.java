package com.cts.repository;

import com.cts.entity.OperationalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OperationalReportRepository extends JpaRepository<OperationalReport, Long> {
    List<OperationalReport> findAllByOrderByGeneratedDateDesc();
}
