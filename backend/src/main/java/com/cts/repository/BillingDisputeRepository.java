package com.cts.repository;

import com.cts.entity.BillingDispute;
import com.cts.enums.BillDisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillingDisputeRepository extends JpaRepository<BillingDispute, Long> {
	List<BillingDispute> findAllByOrderByDisputeIdDesc();

	List<BillingDispute> findByBillDisputeStatusOrderByDisputeIdDesc(BillDisputeStatus status);
}
