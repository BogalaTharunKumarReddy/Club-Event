package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/** A coordinator/member assigning a volunteer to an event with a shift. */
public record VolunteerAssignRequest(
        @NotNull Long volunteerId,
        @NotBlank @Size(max = 120) String role,
        @Size(max = 200) String location,
        Instant shiftStart,
        Instant shiftEnd,
        boolean checkInDuty
) {
}
