package com.cts.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;

@RestController
@RequestMapping("/api/v1")
public class HealthController {
    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    // Liveness check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Application is running");
    }
    // Readiness check (DB connectivity)
    @GetMapping("/ready")
    public ResponseEntity<String> readiness() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                return ResponseEntity.ok("Application is ready");
            } else {
                return ResponseEntity.status(500).body("Database not ready");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database connection failed");
        }
    }
}