package com.campusconnect.dto.response;

/**
 * A single ranked row in a competition leaderboard.
 *
 * @param participantType {@code "TEAM"} for team-based competitions, otherwise {@code "INDIVIDUAL"}
 * @param participantId   the user id or team id depending on {@code participantType}
 */
public record LeaderboardEntry(
        int rank,
        String participantType,
        Long participantId,
        String name,
        double totalPoints
) {
}
