package com.campusconnect.dto.response;

import java.time.Instant;

public record ScoreResponse(
        Long id,
        Long roundId,
        String roundName,
        Long judgeId,
        String judgeName,
        Long participantId,
        String participantName,
        Long teamId,
        String teamName,
        Double points,
        String remarks,
        Instant createdAt
) {
}
