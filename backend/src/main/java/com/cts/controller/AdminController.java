package com.cts.controller;

import com.cts.dto.AdminCreateUserRequestDto;
import com.cts.dto.AdminUserRoleDto;
import com.cts.dto.CreateAgentRequestDto;
import com.cts.dto.DeactivateCustomerDto;
import com.cts.dto.RoleRequestDto;
import com.cts.dto.RoleResponseDto;
import com.cts.dto.UpdateUserRolesRequestDto;
import com.cts.entity.Customer;
import com.cts.service.CustomerService;
import com.cts.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final CustomerService customerService;

    @PostMapping("/create-agent")
    public String createAgent(
            @Valid @RequestBody CreateAgentRequestDto request) {
        userService.createAgent(request);
        return "Agent created successfully";
    }

    @PostMapping("/users")
    public String createUserWithRole(@Valid @RequestBody AdminCreateUserRequestDto request) {
        userService.createUserWithRole(request);
        return "User created successfully";
    }

    @GetMapping("/roles")
    public List<RoleResponseDto> getRoles() {
        return userService.getRoles();
    }

    @PostMapping("/roles")
    public RoleResponseDto createRole(@Valid @RequestBody RoleRequestDto request) {
        return userService.createRole(request);
    }

    @PutMapping("/roles/{roleId}")
    public RoleResponseDto updateRole(@PathVariable Long roleId, @Valid @RequestBody RoleRequestDto request) {
        return userService.updateRole(roleId, request);
    }

    @DeleteMapping("/roles/{roleId}")
    public String deleteRole(@PathVariable Long roleId) {
        userService.deleteRole(roleId);
        return "Role deleted successfully";
    }

    @GetMapping("/users")
    public List<AdminUserRoleDto> getUsersForRoleManagement(@RequestParam(required = false) String search) {
        return userService.getUsersForRoleManagement(search);
    }

    @PutMapping("/users/{userId}/roles")
    public String updateUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRolesRequestDto request
    ) {
        userService.updateUserRoles(userId, request);
        return "User roles updated successfully";
    }

    @DeleteMapping("/users/{userId}")
    public String deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return "User deleted successfully";
    }

    @PutMapping("/customers/{customerId}/approve")
    public String approveCustomer(@PathVariable Long customerId){
        customerService.approveCustomer(customerId);
        return "Customer approved successfully";
    }

    @PutMapping("/customers/{customerId}/reject")
    public String rejectCustomer(
            @PathVariable Long customerId,
            @RequestBody(required = false) Map<String, String> body
    ){
        String reason = body != null ? body.get("reason") : null;
        customerService.rejectCustomer(customerId, reason);
        return "Customer rejected successfully";
    }

    @PutMapping("/customers/{customerId}/deactivate")
    public String deactivateCustomer(
            @PathVariable Long customerId,
            @RequestBody DeactivateCustomerDto dto){
        customerService.deactivateCustomer(customerId, dto.getReason());
        return "Customer deactivated successfully";
    }

    @PutMapping("/customers/{customerId}/reactivate")
    public String reactivateCustomer(
            @PathVariable Long customerId){
        customerService.reactivateCustomer(customerId);
        return "Customer reactivated successfully";
    }

    @GetMapping("/customers/pending")
    public List<Customer> getPendingCustomers(){
        return customerService.getPendingCustomers();
    }
}
