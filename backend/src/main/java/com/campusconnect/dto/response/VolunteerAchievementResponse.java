package com.campusconnect.dto.response;

import java.time.Instant;

/**
 * A computed volunteer achievement/badge. Achievements are derived on the fly
 * from hours, tasks and events (no separate table), so {@code earned} indicates
 * whether the threshold has been met and {@code earnedAt} is best-effort.
 */
public record VolunteerAchievementResponse(
        String code,
        String name,
        String description,
        String icon,
        boolean earned,
        Instant earnedAt
) {
}
