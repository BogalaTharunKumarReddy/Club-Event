package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.ClubRole;
import com.campusconnect.entity.enums.MembershipStatus;

import java.time.Instant;

public record ClubMemberResponse(
        Long id,
        Long clubId,
        String clubName,
        Long userId,
        String fullName,
        String email,
        ClubRole clubRole,
        MembershipStatus status,
        Instant joinedAt
) {
}
