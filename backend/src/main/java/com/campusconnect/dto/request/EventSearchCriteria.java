package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.EventMode;
import com.campusconnect.entity.enums.EventStatus;

import java.time.LocalDateTime;

/** Optional filters for event search. All fields are nullable. */
public record EventSearchCriteria(
        String q,
        String category,
        EventMode mode,
        EventStatus status,
        Long clubId,
        Boolean paid,
        Boolean team,
        Boolean featured,
        LocalDateTime from,
        LocalDateTime to
) {
}
