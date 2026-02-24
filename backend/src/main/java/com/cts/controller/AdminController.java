package com.cts.controller;

import com.cts.dto.CreateAgentRequestDto;
import com.cts.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;

    @PostMapping("/create-agent")
    public String createAgent(@RequestBody CreateAgentRequestDto request) {
        userService.createAgent(request);
        return "Agent created successfully";
    }
}
