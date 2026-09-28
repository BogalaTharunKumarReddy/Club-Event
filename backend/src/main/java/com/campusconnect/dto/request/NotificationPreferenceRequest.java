package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Full replacement of a user's email notification preferences. Every flag is required
 * so a {@code PUT} unambiguously sets the complete state (no partial-merge surprises).
 */
public record NotificationPreferenceRequest(
        @NotNull(message = "emailEnabled is required") Boolean emailEnabled,
        @NotNull(message = "emailOnEvents is required") Boolean emailOnEvents,
        @NotNull(message = "emailOnAnnouncements is required") Boolean emailOnAnnouncements,
        @NotNull(message = "emailOnCertificates is required") Boolean emailOnCertificates,
        @NotNull(message = "emailOnPayments is required") Boolean emailOnPayments,
        @NotNull(message = "emailOnGeneral is required") Boolean emailOnGeneral
) {
}
