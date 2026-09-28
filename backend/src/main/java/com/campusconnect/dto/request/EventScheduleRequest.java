package com.campusconnect.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventScheduleRequest(
        @NotBlank(message = "Session title is required")
        @Size(max = 180)
        String title,

        @Size(max = 10000)
        String description,

        @NotNull(message = "Session start time is required")
        LocalDateTime startDateTime,

        LocalDateTime endDateTime,

        @Min(value = 1, message = "Day number must be at least 1")
        Integer dayNumber,

        @Size(max = 140)
        String speaker,

        @Size(max = 200)
        String venue
) {
}
