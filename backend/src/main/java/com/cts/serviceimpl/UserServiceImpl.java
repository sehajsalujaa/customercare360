package com.cts.serviceimpl;

import com.cts.dto.AdminCreateUserRequestDto;
import com.cts.dto.AdminUserRoleDto;
import com.cts.dto.CreateAgentRequestDto;
import com.cts.dto.CreateCustomerDto;
import com.cts.dto.RoleRequestDto;
import com.cts.dto.RoleResponseDto;
import com.cts.dto.UpdateUserRolesRequestDto;
import com.cts.entity.Customer;
import com.cts.entity.Role;
import com.cts.entity.User;
import com.cts.enums.NotificationType;
import com.cts.exception.CustomException;
import com.cts.repository.CustomerRepository;
import com.cts.repository.RoleRepository;
import com.cts.repository.UserRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.AuditService;
import com.cts.service.NotificationService;
import com.cts.service.UserService;
import com.cts.utils.CustomerBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;

    @Override
    public void createAgent(CreateAgentRequestDto request) {
        createUserWithRole(new AdminCreateUserRequestDto(
                request.getUsername(),
                request.getEmail(),
                request.getPhone(),
                "ROLE_AGENT"
        ));
    }

    @Override
    public void createUserWithRole(AdminCreateUserRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException("Email already exists");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new CustomException("Phone already exists");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new CustomException("Username already exists");
        }

        String normalizedRoleName = normalizeRoleName(request.getRoleName());
        Role role = roleRepository.findByName(normalizedRoleName)
                .orElseThrow(() -> new CustomException("Role not found: " + normalizedRoleName));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode("Temp@123"));
        user.setEnabled(true);
        user.setAccountNonLocked(true);
        user.setFirstLogin(true);
        user.getRoles().add(role);
        userRepository.save(user);

        safeNotifyUser(
            user.getUserID(),
            "Your account has been created with role " + normalizedRoleName + ". Please login and reset your password.",
            NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "User");
    }

    @Override
    public List<RoleResponseDto> getRoles() {
        return roleRepository.findAllByOrderByNameAsc()
                .stream()
                .map(r -> new RoleResponseDto(r.getId(), r.getName()))
                .toList();
    }

    @Override
    public RoleResponseDto createRole(RoleRequestDto request) {
        String roleName = normalizeRoleName(request.getName());
        if (roleRepository.existsByName(roleName)) {
            throw new CustomException("Role already exists");
        }

        Role role = Role.builder()
                .name(roleName)
                .permissions(new HashSet<>())
                .build();
        role = roleRepository.save(role);

        auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "Role");
        return new RoleResponseDto(role.getId(), role.getName());
    }

    @Override
    public RoleResponseDto updateRole(Long roleId, RoleRequestDto request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new CustomException("Role not found"));

        String roleName = normalizeRoleName(request.getName());
        if (!role.getName().equals(roleName) && roleRepository.existsByName(roleName)) {
            throw new CustomException("Role name already exists");
        }

        role.setName(roleName);
        role = roleRepository.save(role);
        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Role");
        return new RoleResponseDto(role.getId(), role.getName());
    }

    @Override
    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new CustomException("Role not found"));

        if ("ROLE_ADMIN".equals(role.getName())) {
            throw new CustomException("ROLE_ADMIN cannot be deleted");
        }

        List<User> assignedUsers = userRepository.findByRolesName(role.getName());
        if (!assignedUsers.isEmpty()) {
            throw new CustomException("Cannot delete role assigned to users");
        }

        roleRepository.delete(role);
        auditService.logAction(securityUtil.getCurrentUserId(), "DELETE", "Role");
    }

    @Override
    public List<AdminUserRoleDto> getUsersForRoleManagement(String search) {
        List<User> users = (search == null || search.isBlank())
                ? userRepository.findAll()
                : userRepository.searchUsers(search.trim());

        return users.stream()
                .map(user -> AdminUserRoleDto.builder()
                        .userId(user.getUserID())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .enabled(user.isEnabled())
                        .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                        .build())
                .toList();
    }

    @Override
    public void updateUserRoles(Long userId, UpdateUserRolesRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));

        Set<Role> roles = request.getRoles().stream()
                .map(this::normalizeRoleName)
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new CustomException("Role not found: " + roleName)))
                .collect(Collectors.toSet());

        user.setRoles(roles);
        userRepository.save(user);

        String updatedRoles = roles.stream().map(Role::getName).sorted().collect(Collectors.joining(", "));
        safeNotifyUser(
            user.getUserID(),
            "Your role access has been updated: " + updatedRoles,
            NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "User Roles");
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));

        if (user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()))) {
            throw new CustomException("Admin user cannot be deleted");
        }

        userRepository.delete(user);
        auditService.logAction(securityUtil.getCurrentUserId(), "DELETE", "User");
    }

    @Transactional
    @Override
    public User createCustomerByAgent(CreateCustomerDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException("Email already exists");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new CustomException("Phone already exists");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new CustomException("Username already exists");
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
        Customer customer = CustomerBuilder.buildCustomer(
                user,
                request.getName(),
                request.getAddress(),
                request.getRegionCode(),
                request.getCustomerType()
        );
        customerRepository.save(customer);

        try {
            Long currentAgentId = securityUtil.getCurrentUserId();
            String type = request.getCustomerType() != null ? request.getCustomerType().name() : "UNKNOWN";

            if (currentAgentId != null) {
                String message = "Customer \"" + request.getName() + "\" (" + type + ") created and sent for admin approval.";
                notificationService.createNotification(currentAgentId, message, NotificationType.SERVICE);
            }

            String customerMessage = "Welcome to CustomerCare360. Your profile has been created by an agent and is pending admin approval.";
            notificationService.createNotification(user.getUserID(), customerMessage, NotificationType.SERVICE);

            List<User> admins = userRepository.findByRolesName("ROLE_ADMIN");
            for (User admin : admins) {
                String adminMessage = "Approval pending: Customer \"" + request.getName() + "\" (" + type + ") registered by agent userId=" + currentAgentId + ".";
                notificationService.createNotification(admin.getUserID(), adminMessage, NotificationType.SERVICE);
            }
        } catch (Exception e) {
            log.error("Notification creation failed", e);
        }

        try {
            auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "User");
        } catch (Exception e) {
            log.error("Audit log failed", e);
        }
        return user;
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new CustomException("Role cannot be empty");
        }
        String normalized = roleName.trim().toUpperCase()
                .replace(" ", "_")
                .replace("-", "_");
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        return normalized;
    }

    private void safeNotifyUser(Long userId, String message, NotificationType type) {
        try {
            if (userId != null) {
                notificationService.createNotification(userId, message, type);
            }
        } catch (Exception e) {
            log.error("Notification failed for userId={}", userId, e);
        }
    }
}
