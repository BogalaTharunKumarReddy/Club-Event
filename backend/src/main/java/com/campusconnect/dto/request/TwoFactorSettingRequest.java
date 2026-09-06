package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;

/** Toggles email-OTP two-factor authentication for the current user. */
public record TwoFactorSettingRequest(
        @NotNull(message = "enabled is required")
        Boolean enabled
) {
}
