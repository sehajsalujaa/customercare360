package com.cts.serviceimpl;

import com.cts.entity.AuditLog;
import com.cts.repository.AuditLogRepository;
import com.cts.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {
    private final AuditLogRepository auditLogRepository;

    @Override
    public void logAction(Long userId, String action, String entity) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entity(entity)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }
}
