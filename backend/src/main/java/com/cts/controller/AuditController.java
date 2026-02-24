package com.cts.controller;

import com.cts.entity.AuthAudit;
import com.cts.repository.AuthAuditRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuthAuditRepository authAuditRepository;

    @GetMapping
    public List<AuthAudit> getAllLogs() {
        return authAuditRepository.findAll();
    }

    @GetMapping("/filter")
    public List<AuthAudit> filterLogs(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end
    ) {
        if (email != null && start != null && end != null) {
            return authAuditRepository.findByEmailAndTimestampBetween(
                    email,
                    LocalDateTime.parse(start),
                    LocalDateTime.parse(end)
            );
        }
        if (start != null && end != null) {
            return authAuditRepository.findByTimestampBetween(
                    LocalDateTime.parse(start),
                    LocalDateTime.parse(end)
            );
        }
        if (email != null) {
            return authAuditRepository.findByEmail(email);
        }
        return authAuditRepository.findAll();
    }

    @GetMapping("/export")
    public void exportCsv(HttpServletResponse response) throws IOException {
        List<AuthAudit> logs = authAuditRepository.findAll();
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=audit_logs.csv");
        PrintWriter writer = response.getWriter();
        writer.println("Email,Action,Status,Timestamp");
        for (AuthAudit log : logs) {
            writer.println(
                    log.getEmail() + "," +
                            log.getAction() + "," +
                            log.getStatus() + "," +
                            log.getTimestamp()
            );
        }
        writer.flush();
        writer.close();
    }
}