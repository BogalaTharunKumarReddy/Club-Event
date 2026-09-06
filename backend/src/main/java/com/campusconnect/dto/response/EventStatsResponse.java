package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.EventStatus;

import java.math.BigDecimal;

public record EventStatsResponse(
        Long eventId,
        String eventTitle,
        EventStatus status,
        long totalRegistrations,
        long activeRegistrations,
        long confirmed,
        long waitlisted,
        long cancelled,
        long attendanceCount,
        double attendanceRate,
        BigDecimal revenue,
        double averageRating,
        long feedbackCount
) {
}
