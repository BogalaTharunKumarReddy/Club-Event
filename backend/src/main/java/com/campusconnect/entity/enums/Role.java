package com.campusconnect.entity.enums;

/**
 * Global platform role used for Spring Security authorization.
 * A role hierarchy is configured so higher roles inherit lower-role permissions:
 * ADMIN &gt; CLUB_COORDINATOR &gt; CLUB_MEMBER &gt; STUDENT.
 *
 * <p>ADMIN is the full-platform administrator: it manages all users, clubs,
 * events, payments and certificates and is not scoped to any single club.
 */
public enum Role {
    STUDENT,
    CLUB_MEMBER,
    CLUB_COORDINATOR,
    ADMIN
}
