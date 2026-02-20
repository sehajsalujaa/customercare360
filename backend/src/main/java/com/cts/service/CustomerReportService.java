//Generates and retrieves customer analytics reports.

package com.cts.service;

import com.cts.entity.CustomerReport;

import java.util.List;

public interface CustomerReportService {
    CustomerReport generateReport(CustomerReport report);
    List<CustomerReport> getReportsByScope(String scope);
}
