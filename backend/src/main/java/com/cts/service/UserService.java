//Handles registration and login for all actors (Customer, Agent, Admin, etc.).

package com.cts.service;

import com.cts.dto.AdminCreateUserRequestDto;
import com.cts.dto.AdminUserRoleDto;
import com.cts.dto.CreateAgentRequestDto;
import com.cts.dto.CreateCustomerDto;
import com.cts.dto.RoleRequestDto;
import com.cts.dto.RoleResponseDto;
import com.cts.dto.UpdateUserRolesRequestDto;
import com.cts.entity.User;

import java.util.List;

public interface UserService {
    void createAgent(CreateAgentRequestDto request);

    void createUserWithRole(AdminCreateUserRequestDto request);

    User createCustomerByAgent(CreateCustomerDto request);

    List<RoleResponseDto> getRoles();

    RoleResponseDto createRole(RoleRequestDto request);

    RoleResponseDto updateRole(Long roleId, RoleRequestDto request);

    void deleteRole(Long roleId);

    List<AdminUserRoleDto> getUsersForRoleManagement(String search);

    void updateUserRoles(Long userId, UpdateUserRolesRequestDto request);

    void deleteUser(Long userId);
}
