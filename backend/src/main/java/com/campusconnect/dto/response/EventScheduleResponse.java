package com.campusconnect.dto.response;

import java.time.LocalDateTime;

public record EventScheduleResponse(
        Long id,
        String title,
        String description,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        Integer dayNumber,
        String speaker,
        String venue
) {
}
