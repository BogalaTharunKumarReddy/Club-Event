package com.campusconnect.dto.response;

import java.time.Instant;
import java.util.List;

public record TeamResponse(
        Long id,
        String name,
        Long eventId,
        String eventTitle,
        Long leaderId,
        String leaderName,
        Integer maxSize,
        int memberCount,
        List<TeamMemberResponse> members,
        Instant createdAt
) {
}
