package com.campusconnect.dto.response;

import java.time.Instant;

/**
 * Result of a volunteer scanning a participant's ticket QR for check-in.
 * Carries only what the scanner screen needs to confirm the check-in — no
 * sensitive data beyond the participant's display name and registration id.
 */
public record VolunteerScanResponse(
        boolean verified,
        String participantName,
        Long eventId,
        String eventTitle,
        Long registrationId,
        Instant checkInTime,
        String attendanceStatus,
        String message
) {
}
