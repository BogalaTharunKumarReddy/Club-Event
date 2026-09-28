package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        boolean read,
        String link,
        Instant createdAt
) {
}
