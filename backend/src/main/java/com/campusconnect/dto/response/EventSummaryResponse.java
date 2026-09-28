package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.EventMode;
import com.campusconnect.entity.enums.EventStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Lightweight event view used in listing/search results. */
public record EventSummaryResponse(
        Long id,
        String title,
        String category,
        EventMode mode,
        String venue,
        String bannerUrl,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        LocalDateTime registrationDeadline,
        EventStatus status,
        boolean paidEvent,
        BigDecimal fee,
        boolean teamEvent,
        boolean featured,
        Integer capacity,
        Long clubId,
        String clubName,
        long registeredCount,
        boolean saved
) {
}
