package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.Role;
import jakarta.validation.constraints.NotNull;

/** Admin action: reassign a user's global platform role. */
public record AdminUpdateRoleRequest(
        @NotNull Role role
) {
}
