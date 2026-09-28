package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.VolunteerAttendanceStatus;

import java.time.Instant;

/** A volunteer's shift attendance record for an event. */
public record VolunteerAttendanceResponse(
        Long id,
        Long volunteerId,
        String volunteerName,
        Long eventId,
        String eventTitle,
        Instant checkInTime,
        Instant checkOutTime,
        double hoursWorked,
        VolunteerAttendanceStatus status
) {
}
