package com.campusconnect.dto.response;

public record JudgeResponse(
        Long id,
        Long competitionId,
        Long userId,
        String fullName,
        String email
) {
}
