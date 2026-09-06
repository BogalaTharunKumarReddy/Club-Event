package com.campusconnect.dto.response;

import java.time.Instant;

public record ClubResponse(
        Long id,
        String name,
        String description,
        String category,
        String logoUrl,
        String coverImageUrl,
        String contactEmail,
        String contactPhone,
        boolean active,
        long memberCount,
        long eventCount,
        long followerCount,
        boolean following,
        Long createdById,
        String createdByName,
        Instant createdAt
) {
}
