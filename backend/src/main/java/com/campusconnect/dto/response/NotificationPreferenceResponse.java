package com.campusconnect.dto.response;

/** A user's email notification preferences. */
public record NotificationPreferenceResponse(
        boolean emailEnabled,
        boolean emailOnEvents,
        boolean emailOnAnnouncements,
        boolean emailOnCertificates,
        boolean emailOnPayments,
        boolean emailOnGeneral
) {
}
