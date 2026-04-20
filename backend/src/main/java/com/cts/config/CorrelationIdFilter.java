package com.cts.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.UUID;

@Component
public class CorrelationIdFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        // 🔹 correlationId
        String correlationId = UUID.randomUUID().toString();
        MDC.put("correlationId", correlationId);
        // 🔹 userId (if passed in request)
        String userId = req.getParameter("userId");
        if (userId != null) {
            MDC.put("userId", userId);
        }
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}