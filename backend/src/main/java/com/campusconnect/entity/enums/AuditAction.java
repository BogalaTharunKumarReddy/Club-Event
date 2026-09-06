package com.campusconnect.entity.enums;

/**
 * The set of administrative actions recorded in the audit log. Kept coarse and
 * stable: each value maps to a distinct mutating operation an admin can perform
 * from the platform-administration screens.
 */
public enum AuditAction {
    USER_ROLE_CHANGED,
    USER_ENABLED,
    USER_DISABLED,
    USER_DELETED,
    CLUB_ACTIVATED,
    CLUB_DEACTIVATED,
    CLUB_DELETED,
    EVENT_STATUS_CHANGED,
    EVENT_DELETED
}
