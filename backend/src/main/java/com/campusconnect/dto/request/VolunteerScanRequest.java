package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * A volunteer scanning a participant ticket for check-in. The QR payload is the
 * opaque ticket code only — never personal data. The eventId scopes the scan so
 * a volunteer can only check people into an event they hold check-in duty for.
 */
public record VolunteerScanRequest(
        @NotNull Long eventId,
        @NotBlank String ticketCode
) {
}
