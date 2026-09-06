package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * A student's request to volunteer for an event. {@code preferredRole} is an optional note about
 * how they'd like to help (e.g. "Registration desk", "Logistics"); coordinators may override it on
 * approval.
 */
public record VolunteerApplyRequest(
        @NotNull Long eventId,
        @Size(max = 120) String preferredRole
) {
}
