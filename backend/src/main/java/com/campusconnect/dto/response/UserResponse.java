package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        String studentId,
        String department,
        String phone,
        String profilePhotoUrl,
        String bio,
        boolean emailVerified,
        boolean twoFactorEnabled,
        Instant createdAt
) {
}
