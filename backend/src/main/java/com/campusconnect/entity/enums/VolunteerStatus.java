package com.campusconnect.entity.enums;

/**
 * Lifecycle of a volunteer profile within a club.
 * A coordinator approves ({@code ACTIVE}), pauses ({@code INACTIVE}) or
 * disciplines ({@code SUSPENDED}) a volunteer. Only ACTIVE volunteers may be
 * assigned to events or perform check-in duty.
 */
public enum VolunteerStatus {
    PENDING,
    ACTIVE,
    INACTIVE,
    SUSPENDED
}
