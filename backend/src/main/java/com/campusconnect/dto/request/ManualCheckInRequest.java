package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;

/** Manual check-in performed by a club member when a QR scan is not possible. */
public record ManualCheckInRequest(
        @NotNull(message = "Registration id is required")
        Long registrationId
) {
}
