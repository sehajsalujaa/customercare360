package com.cts.serviceimpl;

import com.cts.entity.Permission;
import com.cts.entity.Role;
import com.cts.entity.User;
import com.cts.service.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JwtServiceImpl implements JwtService {

    private final String SECRET_KEY = "ZmFrZVNlY3JldEtleUZvckpXVEF1dGhlbnRpY2F0aW9uMTIzNDU2Nzg5";

    @Override
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        // Add roles to token
        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .toList();
        claims.put("roles", roles);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
    @Override
    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
    @Override
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    @Override
    public boolean isTokenValid(String token, User user) {
        String username = extractUsername(token);
        return username.equals(user.getEmail());
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        for (Role role : user.getRoles()) {
            // Add role authority
            authorities.add(new SimpleGrantedAuthority(role.getName()));
            // Add permission authorities
            for (Permission permission : role.getPermissions()) {
                authorities.add(new SimpleGrantedAuthority(permission.getName()));
            }
        }
        System.out.println("User Roles: " + user.getRoles());
        System.out.println(("Granted Authorities: " + authorities));
        return authorities;
    }
}
