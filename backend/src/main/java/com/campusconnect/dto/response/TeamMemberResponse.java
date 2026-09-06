package com.campusconnect.dto.response;

import java.time.Instant;

public record TeamMemberResponse(
        Long id,
        Long teamId,
        Long userId,
        String fullName,
        String email,
        boolean leader,
        Instant joinedAt
) {
}
