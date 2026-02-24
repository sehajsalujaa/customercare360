package com.cts.serviceimpl;

import com.cts.dto.*;
import com.cts.entity.*;
import com.cts.enums.OtpPurpose;
import com.cts.enums.UserRole;
import com.cts.enums.UserStatus;
import com.cts.repository.*;
import com.cts.service.AuthService;
import com.cts.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository roleRepository;
    private final AuthAuditRepository authAuditRepository;

    @Override
    public void registerCustomer(RegisterRequestDto request) {
        // 1. Duplicate check
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Phone already exists");
        }
        // 2. Password policy
        validatePassword(request.getPassword());
        // 3. Fetch CUSTOMER role from DB
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        // 4. Create user (disabled initially)
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .accountNonLocked(true)
                .failedAttempts(0)
                .firstLogin(false)
                .roles(Set.of(customerRole))
                .build();
        userRepository.save(user);
        // 5. Generate OTP
        String otpCode = generateOtp();
        Otp otp = Otp.builder()
                .identifier(request.getEmail())
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .purpose(OtpPurpose.REGISTRATION)
                .build();
        otpRepository.save(otp);
        // TODO: Send OTP via email
        System.out.println("OTP: " + otpCode);
    }

    @Override
    public void verifyOtp(OtpVerificationRequestDto request) {
        Otp otp = otpRepository
                .findTopByIdentifierOrderByExpiryTimeDesc(request.getEmailOrPhone())
                .orElseThrow(() -> new RuntimeException("OTP not found"));
        if (otp.isVerified()) {
            throw new RuntimeException("OTP already used");
        }
        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        if (!otp.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        // Activate user
        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);
        otp.setVerified(true);
        otpRepository.save(otp);

        // Create Customer entry after successful activation
        Customer customer = Customer.builder()
                .user(user)
                .customerType("REGULAR")
                .contactInfo(user.getEmail())
                .status(UserStatus.ACTIVE)
                .build();
        customerRepository.save(customer);
    }
    private void validatePassword(String password) {
        if (password.length() < 8 ||
                !password.matches(".*[A-Z].*") ||
                !password.matches(".*[a-z].*") ||
                !password.matches(".*\\d.*")) {
            throw new RuntimeException("Password must contain upper, lower, digit and be 8+ chars");
        }
    }
    private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .or(() -> userRepository.findByPhone(request.getPhone()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.isEnabled()) {
            throw new RuntimeException("Account not activated");
        }
        if (!user.isAccountNonLocked()) {
            if (user.getLockTime() != null &&
                    user.getLockTime().plusMinutes(15).isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Account locked. Try after 15 minutes");
            } else {
                user.setAccountNonLocked(true);
                user.setFailedAttempts(0);
                user.setLockTime(null);
                userRepository.save(user);
            }
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 5) {
                user.setAccountNonLocked(false);
                user.setLockTime(LocalDateTime.now());
                authAuditRepository.save(
                        AuthAudit.builder()
                                .email(user.getEmail())
                                .action("ACCOUNT_LOCKED")
                                .status("FAILED")
                                .timestamp(LocalDateTime.now())
                                .build()
                );
            } else {
                authAuditRepository.save(
                        AuthAudit.builder()
                                .email(user.getEmail())
                                .action("LOGIN_FAILURE")
                                .status("FAILED")
                                .timestamp(LocalDateTime.now())
                                .build()
                );
            }
            userRepository.save(user);
            throw new RuntimeException("Invalid credentials");
        }
        if (user.isFirstLogin()) {
            throw new RuntimeException("Password reset required before login");
        }
        // Reset failed attempts
        user.setFailedAttempts(0);
        userRepository.save(user);
        authAuditRepository.save(
                AuthAudit.builder()
                        .email(user.getEmail())
                        .action("LOGIN_SUCCESS")
                        .status("SUCCESS")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        RefreshToken refresh = RefreshToken.builder()
                .token(refreshToken)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .user(user)
                .build();
        refreshTokenRepository.save(refresh);
        return new LoginResponseDto(accessToken, refreshToken);
    }

    @Override
    public LoginResponseDto refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        if (token.isRevoked() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired or revoked");
        }

        User user = token.getUser();

        // Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        // Revoke old refresh token
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        // Save new refresh token (rotation)
        RefreshToken newToken = RefreshToken.builder()
                .token(newRefreshToken)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .user(user)
                .build();

        refreshTokenRepository.save(newToken);

        return new LoginResponseDto(newAccessToken, newRefreshToken);
    }

    @Override
    public void logoutAll(String emailOrPhone) {
        User user = userRepository.findByEmail(emailOrPhone)
                .or(() -> userRepository.findByPhone(emailOrPhone))
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<RefreshToken> tokens =
                refreshTokenRepository.findByUserAndRevokedFalse(user);
        tokens.forEach(token -> token.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }

    @Override
    public void initiatePasswordReset(String emailOrPhone) {
        User user = userRepository.findByEmail(emailOrPhone)
                .or(() -> userRepository.findByPhone(emailOrPhone))
                .orElseThrow(() -> new RuntimeException("User not found"));
        String otpValue = String.valueOf((int)(Math.random() * 900000) + 100000);
        Otp otp = Otp.builder()
                .identifier(emailOrPhone)
                .otpCode(otpValue)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .verified(false)
                .purpose(OtpPurpose.PASSWORD_RESET)
                .build();
        otpRepository.save(otp);
        System.out.println("PASSWORD RESET OTP: " + otpValue);
    }

    @Override
    public void resetPassword(ResetPasswordRequestDto request) {
        Otp otp = otpRepository
                .findTopByIdentifierOrderByExpiryTimeDesc(request.getEmailOrPhone())
                .orElseThrow(() -> new RuntimeException("OTP not found"));
        if (!otp.getPurpose().equals(OtpPurpose.PASSWORD_RESET)) {
            throw new RuntimeException("Invalid OTP purpose");
        }
        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        if (!otp.getOtpCode().equals(request.getOtpCode())) {
            throw new RuntimeException("Invalid OTP");
        }
        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .or(() -> userRepository.findByPhone(request.getEmailOrPhone()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Optional: reset failed attempts
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        user.setFailedAttempts(0);
        user.setAccountNonLocked(true);

        userRepository.save(user);

        List<RefreshToken> tokens =
                refreshTokenRepository.findByUserAndRevokedFalse(user);
        tokens.forEach(token -> token.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);

        otp.setVerified(true);
        otpRepository.save(otp);
    }
}
