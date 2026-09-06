package com.campusconnect.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ClubDashboardResponse(
        Long clubId,
        String clubName,
        long totalEvents,
        long upcomingEvents,
        long totalMembers,
        long totalRegistrations,
        long totalAttendance,
        BigDecimal totalRevenue,
        double averageRating,
        List<EventStatsResponse> events
) {
}
