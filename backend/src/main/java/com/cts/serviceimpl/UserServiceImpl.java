package com.cts.serviceimpl;

import com.cts.dto.CreateAgentRequestDto;
import com.cts.entity.Role;
import com.cts.entity.User;
import com.cts.repository.RoleRepository;
import com.cts.repository.UserRepository;
import com.cts.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public void createAgent(CreateAgentRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        Role agentRole = roleRepository.findByName("ROLE_AGENT")
                .orElseThrow(() -> new RuntimeException("Agent role not found"));
        User agent = new User();
        agent.setUsername(request.getUsername());
        agent.setEmail(request.getEmail());
        agent.setPhone(request.getPhone());
        agent.setPassword(passwordEncoder.encode("Temp@123"));
        agent.setEnabled(true);
        agent.setAccountNonLocked(true);
        agent.setFirstLogin(true);
        agent.getRoles().add(agentRole);
        userRepository.save(agent);
    }
}
