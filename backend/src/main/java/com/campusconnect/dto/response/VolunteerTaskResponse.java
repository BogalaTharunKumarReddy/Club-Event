package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.TaskStatus;

import java.time.Instant;
import java.time.LocalDateTime;

/** A single task assigned to a volunteer, with the owning event and volunteer for context. */
public record VolunteerTaskResponse(
        Long id,
        Long volunteerId,
        Long eventId,
        String eventTitle,
        Long assigneeId,
        String assigneeName,
        String title,
        String description,
        TaskStatus status,
        LocalDateTime dueAt,
        Instant createdAt
) {
}
