package com.cts.service;

import com.cts.entity.User;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public interface JwtService {
    String generateAccessToken(User user);
    String generateRefreshToken(User user);
    String extractUsername(String token);
    boolean isTokenValid(String token, User user);
    Collection<? extends GrantedAuthority> getAuthorities(User user);
}
