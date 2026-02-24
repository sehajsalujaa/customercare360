package com.cts.repository;

import com.cts.entity.AuthAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AuthAuditRepository extends JpaRepository<AuthAudit, Long> {
    List<AuthAudit> findByEmail(String email);
    List<AuthAudit> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<AuthAudit> findByEmailAndTimestampBetween(
            String email,
            LocalDateTime start,
            LocalDateTime end
    );
}
