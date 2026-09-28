package com.campusconnect.dto.response;

import java.time.Instant;

/**
 * A media gallery item. Exactly one of {@code eventId}/{@code clubId} is populated,
 * indicating whether the item belongs to an event or a club gallery.
 */
public record MediaResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long clubId,
        String clubName,
        String url,
        String mediaType,
        String caption,
        Long uploadedById,
        String uploadedByName,
        Instant createdAt
) {
}
