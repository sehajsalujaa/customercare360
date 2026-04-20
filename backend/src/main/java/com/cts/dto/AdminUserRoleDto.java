package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserRoleDto {
    private Long userId;
    private String username;
    private String email;
    private String phone;
    private boolean enabled;
    private Set<String> roles;
}
