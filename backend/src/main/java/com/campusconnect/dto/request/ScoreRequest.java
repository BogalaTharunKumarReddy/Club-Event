package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * A judge's score for a participant in a round. Provide exactly one of {@code participantId}
 * (individual competition) or {@code teamId} (team-based competition).
 */
public record ScoreRequest(
        @NotNull(message = "Round id is required")
        Long roundId,

        Long participantId,

        Long teamId,

        @NotNull(message = "Points are required")
        @PositiveOrZero(message = "Points cannot be negative")
        Double points,

        @Size(max = 2000, message = "Remarks must be at most 2000 characters")
        String remarks
) {
}
