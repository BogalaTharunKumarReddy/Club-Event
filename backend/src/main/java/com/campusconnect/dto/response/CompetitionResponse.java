package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.CompetitionStatus;

import java.time.Instant;

public record CompetitionResponse(
        Long id,
        Long eventId,
        String eventTitle,
        String title,
        String description,
        CompetitionStatus status,
        boolean teamBased,
        int roundCount,
        int judgeCount,
        Instant createdAt
) {
}
