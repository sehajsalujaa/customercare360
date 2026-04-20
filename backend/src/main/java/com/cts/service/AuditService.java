package com.cts.service;

public interface AuditService {
    void logAction(Long userID, String action, String entity);
}
