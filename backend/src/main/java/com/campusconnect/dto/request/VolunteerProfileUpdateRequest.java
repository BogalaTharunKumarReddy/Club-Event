package com.campusconnect.dto.request;

import jakarta.validation.constraints.Size;

/** A volunteer updating their own skills/availability. */
public record VolunteerProfileUpdateRequest(
        @Size(max = 500) String skills,
        @Size(max = 500) String availability
) {
}
