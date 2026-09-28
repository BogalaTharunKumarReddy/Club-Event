package com.campusconnect.entity.enums;

/**
 * Lifecycle of a volunteer's assignment to a specific event.
 * A coordinator creates it as {@code ASSIGNED}; the volunteer accepts it, works
 * it, and it is marked {@code COMPLETED}, or either party {@code CANCELLED}s.
 */
public enum VolunteerAssignmentStatus {
    ASSIGNED,
    ACCEPTED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
