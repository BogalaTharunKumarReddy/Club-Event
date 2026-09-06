package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.EventMode;
import com.campusconnect.entity.enums.EventStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String title,
        String description,
        String category,
        String bannerUrl,
        EventMode mode,
        String venue,
        String onlineUrl,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        LocalDateTime registrationDeadline,
        Integer capacity,
        String rules,
        String instructions,
        EventStatus status,
        boolean paidEvent,
        BigDecimal fee,
        boolean teamEvent,
        Integer minTeamSize,
        Integer maxTeamSize,
        boolean featured,
        Long clubId,
        String clubName,
        Long createdById,
        String createdByName,
        long registeredCount,
        boolean saved,
        Instant createdAt
) {
}
