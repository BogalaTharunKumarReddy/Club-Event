package com.campusconnect.dto.response;

<<<<<<< HEAD
import com.campusconnect.entity.enums.VolunteerStatus;

import java.time.Instant;

/** A volunteer profile with its owning user and club, for the volunteer and coordinators. */
public record VolunteerResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String studentId,
        String department,
        String phone,
        String profilePhotoUrl,
        Long clubId,
        String clubName,
        VolunteerStatus status,
        String skills,
        String availability,
        double totalHours,
        boolean volunteerLead,
=======
import java.time.Instant;

/**
 * A volunteer enrollment for an event. Task counts summarise the volunteer's workload so the
 * coordinator roster can show progress at a glance.
 */
public record VolunteerResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long userId,
        String userName,
        String userEmail,
        boolean approved,
        String role,
        long taskCount,
        long completedTaskCount,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        Instant createdAt
) {
}
