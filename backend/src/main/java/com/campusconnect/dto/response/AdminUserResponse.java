package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.Role;

import java.time.Instant;

/**
 * User view for the admin console. Unlike the public {@link UserResponse} this
 * exposes the account {@code enabled} flag so admins can manage access. It still
 * never carries the password hash.
 */
public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        String studentId,
        String department,
        String phone,
        String profilePhotoUrl,
        boolean enabled,
        boolean emailVerified,
        Instant createdAt
) {
}
