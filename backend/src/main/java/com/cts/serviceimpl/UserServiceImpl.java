package com.cts.serviceimpl;

import com.cts.dto.CreateAgentRequestDto;
import com.cts.dto.CreateCustomerDto;
import com.cts.entity.Customer;
import com.cts.entity.Role;
import com.cts.entity.User;
import com.cts.enums.CustomerStatus;
import com.cts.exception.CustomException;
import com.cts.repository.CustomerRepository;
import com.cts.repository.RoleRepository;
import com.cts.repository.UserRepository;
import com.cts.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void createAgent(CreateAgentRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException("Email already exists");
        }
        Role agentRole = roleRepository.findByName("ROLE_AGENT")
                .orElseThrow(() -> new CustomException("Agent role not found"));
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

    @Override
    public User createCustomerByAgent(CreateCustomerDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException("Email already exists");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new CustomException("Phone already exists");
        }
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new CustomException("Customer role not found"));
        // Create User
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .accountNonLocked(true)
                .roles(Set.of(customerRole))
                .build();
        userRepository.save(user);
        // Create Customer Profile
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setCustomerType(request.getCustomerType());
        customer.setName(request.getName());
        customer.setAddress(request.getAddress());
        customer.setCountryCode(request.getCountryCode());
        customer.setRegionCode(request.getRegionCode());
        customer.setCustomerStatus(CustomerStatus.PENDING);
        customerRepository.save(customer);
        return user;
    }
}
