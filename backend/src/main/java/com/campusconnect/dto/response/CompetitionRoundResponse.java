package com.campusconnect.dto.response;

import java.time.Instant;
import java.time.LocalDateTime;

public record CompetitionRoundResponse(
        Long id,
        Long competitionId,
        String name,
        Integer roundNumber,
        String description,
        Double maxScore,
        LocalDateTime scheduledAt,
        Instant createdAt
) {
}
