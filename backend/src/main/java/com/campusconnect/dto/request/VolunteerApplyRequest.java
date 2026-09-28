package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

<<<<<<< HEAD
/** A user applying to volunteer for a club. */
public record VolunteerApplyRequest(
        @NotNull Long clubId,
        @Size(max = 500) String skills,
        @Size(max = 500) String availability
=======
/**
 * A student's request to volunteer for an event. {@code preferredRole} is an optional note about
 * how they'd like to help (e.g. "Registration desk", "Logistics"); coordinators may override it on
 * approval.
 */
public record VolunteerApplyRequest(
        @NotNull Long eventId,
        @Size(max = 120) String preferredRole
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
) {
}
