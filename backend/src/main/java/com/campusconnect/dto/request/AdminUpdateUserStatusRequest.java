package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;

/** Admin action: enable or disable a user account (disabled users cannot log in). */
public record AdminUpdateUserStatusRequest(
        @NotNull Boolean enabled
) {
}
