package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.VolunteerAssignmentStatus;

import java.time.Instant;

/** A single shift entry on the volunteer schedule/calendar. */
public record VolunteerScheduleItemResponse(
        Long assignmentId,
        Long eventId,
        String eventTitle,
        String role,
        String location,
        Instant shiftStart,
        Instant shiftEnd,
        VolunteerAssignmentStatus status
) {
}
