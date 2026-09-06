package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CompetitionRequest(
        @NotNull(message = "Event id is required")
        Long eventId,

        @NotBlank(message = "Title is required")
        @Size(max = 180, message = "Title must be at most 180 characters")
        String title,

        @Size(max = 5000, message = "Description must be at most 5000 characters")
        String description,

        boolean teamBased
) {
}
