package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** Coordinator/admin payload to assign a task to a volunteer. */
public record VolunteerTaskRequest(
        @NotBlank @Size(max = 180) String title,
        @Size(max = 4000) String description,
        LocalDateTime dueAt
) {
}
