package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.VolunteerTaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/** A coordinator/member creating a task for a volunteer at an event. */
public record VolunteerTaskCreateRequest(
        @NotNull Long volunteerId,
        @NotBlank @Size(max = 150) String title,
        @Size(max = 5000) String description,
        @Size(max = 5000) String instructions,
        @Size(max = 200) String location,
        VolunteerTaskPriority priority,
        Instant startTime,
        Instant endTime
) {
}
