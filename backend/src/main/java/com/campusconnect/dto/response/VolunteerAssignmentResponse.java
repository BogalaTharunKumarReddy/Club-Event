package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.VolunteerAssignmentStatus;

import java.time.Instant;
import java.time.LocalDateTime;

/** A volunteer's assignment to an event, with the event context needed by the UI. */
public record VolunteerAssignmentResponse(
        Long id,
        Long volunteerId,
        String volunteerName,
        Long eventId,
        String eventTitle,
        String eventBannerUrl,
        String eventVenue,
        LocalDateTime eventStart,
        LocalDateTime eventEnd,
        Long clubId,
        String clubName,
        String role,
        Instant shiftStart,
        Instant shiftEnd,
        String location,
        boolean checkInDuty,
        VolunteerAssignmentStatus status
) {
}
