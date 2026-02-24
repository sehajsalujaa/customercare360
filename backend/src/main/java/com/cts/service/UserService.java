//Handles registration and login for all actors (Customer, Agent, Admin, etc.).

package com.cts.service;

import com.cts.dto.CreateAgentRequestDto;

public interface UserService {
    void createAgent(CreateAgentRequestDto request);
}
