package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;

public record RegistrationRequest(
        @NotNull(message = "Event id is required")
        Long eventId,

        /** Required only for team events — the team the user is registering with. */
        Long teamId
) {
}
