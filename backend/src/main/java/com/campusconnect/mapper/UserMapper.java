package com.campusconnect.mapper;

import com.campusconnect.dto.response.AdminUserResponse;
import com.campusconnect.dto.response.UserResponse;
import com.campusconnect.entity.User;

/** Maps {@link User} entities to safe response DTOs (never exposes the password hash). */
public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStudentId(),
                user.getDepartment(),
                user.getPhone(),
                user.getProfilePhotoUrl(),
                user.getBio(),
                user.isEmailVerified(),
                user.isTwoFactorEnabled(),
                user.getCreatedAt()
        );
    }

    /** Admin-console view — adds the {@code enabled} flag, still no password hash. */
    public static AdminUserResponse toAdminResponse(User user) {
        if (user == null) {
            return null;
        }
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStudentId(),
                user.getDepartment(),
                user.getPhone(),
                user.getProfilePhotoUrl(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}
