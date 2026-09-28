package com.campusconnect.dto.response;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long userId,
        String userName,
        Integer rating,
        String comment,
        String suggestion,
        Instant createdAt
) {
}
