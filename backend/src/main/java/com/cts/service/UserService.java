//Handles registration and login for all actors (Customer, Agent, Admin, etc.).

package com.cts.service;

import com.cts.dto.CreateAgentRequestDto;
import com.cts.dto.CreateCustomerDto;
import com.cts.entity.User;

public interface UserService {
    void createAgent(CreateAgentRequestDto request);
    User createCustomerByAgent(CreateCustomerDto request);
}
