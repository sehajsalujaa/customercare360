package com.cts.config;

import com.cts.entity.Permission;
import com.cts.entity.Role;
import com.cts.entity.User;
import com.cts.repository.PermissionRepository;
import com.cts.repository.RoleRepository;
import com.cts.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    @PostConstruct
    public void init() {
        Permission customerRead = permissionRepository
                .findByName("CUSTOMER_READ")
                .orElseGet(() ->
                        permissionRepository.save(
                                Permission.builder().name("CUSTOMER_READ").build()
                        )
                );
        Permission customerWrite = permissionRepository
                .findByName("CUSTOMER_WRITE")
                .orElseGet(() ->
                        permissionRepository.save(
                                Permission.builder().name("CUSTOMER_WRITE").build()
                        )
                );
        Permission agentRead = permissionRepository
                .findByName("AGENT_READ")
                .orElseGet(() ->
                        permissionRepository.save(
                                Permission.builder().name("AGENT_READ").build()
                        )
                );

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_ADMIN")
                                        .permissions(Set.of(customerRead, customerWrite))
                                        .build()
                        )
                );
        roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_CUSTOMER")
                                        .permissions(Set.of(customerRead))
                                        .build()
                        )
                );
        roleRepository.findByName("ROLE_AGENT")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_AGENT")
                                        .permissions(Set.of(agentRead))
                                        .build()
                        )
                );

        roleRepository.findByName("ROLE_BILLING_ANALYST")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_BILLING_ANALYST")
                                        .permissions(Set.of(agentRead))
                                        .build()
                        )
                );

        roleRepository.findByName("ROLE_FIELD_COORDINATOR")
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name("ROLE_FIELD_COORDINATOR")
                                        .permissions(Set.of(agentRead))
                                        .build()
                        )
                );

        roleRepository.findByName("ROLE_BILLING_ANALYST").ifPresent(analystRole ->
                userRepository.findByEmail("analyst1@gmail.com").ifPresent(user -> {
                    if (user.getRoles().stream().noneMatch(r -> "ROLE_BILLING_ANALYST".equals(r.getName()))) {
                        user.getRoles().add(analystRole);
                        userRepository.save(user);
                    }
                })
        );

        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPhone("9999999999");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setEnabled(true);
            admin.setAccountNonLocked(true);
            admin.setFirstLogin(false);
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
        }
    }
}