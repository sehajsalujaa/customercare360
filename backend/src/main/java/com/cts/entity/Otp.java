package com.cts.entity;

import com.cts.enums.OtpPurpose;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String identifier;
    private String otpCode;
    private LocalDateTime expiryTime;
    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    private OtpPurpose purpose;
}
