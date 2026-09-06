package com.campusconnect.dto.response;

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
        Instant createdAt
) {
}
