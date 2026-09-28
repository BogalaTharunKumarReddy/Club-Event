package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.AnnouncementScope;

import java.time.Instant;

public record AnnouncementResponse(
        Long id,
        AnnouncementScope scope,
        Long clubId,
        String clubName,
        Long eventId,
        String eventTitle,
        String title,
        String content,
        boolean pinned,
        Long authorId,
        String authorName,
        Instant createdAt
) {
}
