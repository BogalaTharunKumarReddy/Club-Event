package com.campusconnect.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TeamRequest(
        @NotBlank(message = "Team name is required")
        @Size(max = 140, message = "Team name must be at most 140 characters")
        String name,

        @NotNull(message = "Event id is required")
        Long eventId,

        /** Optional cap on team size. Defaults to the event's maximum team size when omitted. */
        @Min(value = 1, message = "Maximum team size must be at least 1")
        Integer maxSize
) {
}
