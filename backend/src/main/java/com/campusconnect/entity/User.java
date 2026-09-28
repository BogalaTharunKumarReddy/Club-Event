package com.campusconnect.entity;

import com.campusconnect.entity.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "users",
        indexes = @Index(name = "idx_user_email", columnList = "email"),
        uniqueConstraints = @UniqueConstraint(name = "uk_user_email", columnNames = "email")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;

    @Column(length = 40)
    private String studentId;

    @Column(length = 120)
    private String department;

    @Column(length = 20)
    private String phone;

    private String profilePhotoUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean emailVerified = false;

    private String verificationToken;

    private String resetToken;

    private Instant resetTokenExpiry;

    // ---- Two-factor authentication (opt-in email OTP) ----

    /** When true, a successful password check issues an email OTP challenge before tokens. */
    @Builder.Default
    @Column(nullable = false)
    private boolean twoFactorEnabled = false;

    /** BCrypt hash of the current login OTP (never the raw code). Null when no challenge is active. */
    private String otpCodeHash;

    /** Expiry for {@link #otpCodeHash}. */
    private Instant otpExpiry;

    /** Failed OTP verification attempts for the active challenge (locks the challenge past a limit). */
    @Builder.Default
    @Column(nullable = false)
    private int otpAttempts = 0;

    /**
     * Opaque handle returned to the client after the password step; the client echoes it back
     * with the OTP code so we never expose the user id during the challenge. Null when inactive.
     */
    private String otpChallengeToken;
}
