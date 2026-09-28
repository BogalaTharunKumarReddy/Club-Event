package com.campusconnect.dto.response;

import java.util.Map;

/**
 * Aggregated feedback for an event.
 *
 * @param distribution star value (1..5) → number of ratings at that value
 */
public record FeedbackSummary(
        Long eventId,
        double averageRating,
        long totalResponses,
        Map<Integer, Long> distribution
) {
}
