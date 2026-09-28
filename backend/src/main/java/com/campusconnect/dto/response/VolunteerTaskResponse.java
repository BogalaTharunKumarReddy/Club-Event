package com.campusconnect.dto.response;

<<<<<<< HEAD
import com.campusconnect.entity.enums.VolunteerTaskPriority;
import com.campusconnect.entity.enums.VolunteerTaskStatus;

import java.time.Instant;

/** A volunteer task with its event context. */
public record VolunteerTaskResponse(
        Long id,
        Long volunteerId,
        String volunteerName,
        Long eventId,
        String eventTitle,
        String assignedByName,
        String title,
        String description,
        String instructions,
        String location,
        VolunteerTaskPriority priority,
        Instant startTime,
        Instant endTime,
        VolunteerTaskStatus status,
        Instant startedAt,
        Instant completedAt,
        String completionNotes,
=======
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
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        Instant createdAt
) {
}
