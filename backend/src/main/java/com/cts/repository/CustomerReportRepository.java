package com.cts.repository;

import com.cts.entity.CustomerReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerReportRepository extends JpaRepository<CustomerReport, Long> {
    // Example: find reports by scope
    List<CustomerReport> findByScope(String scope);
}
