package com.campusconnect.service;

import com.campusconnect.dto.response.ClubDashboardResponse;
import com.campusconnect.dto.response.EventStatsResponse;

public interface AnalyticsService {

    /** Aggregated dashboard for a club. Coordinator of the club only. */
    ClubDashboardResponse clubDashboard(Long actingUserId, Long clubId);

    /** Detailed statistics for a single event. Coordinator of the event's club only. */
    EventStatsResponse eventStats(Long actingUserId, Long eventId);

    /** Excel (.xlsx) report for a club: summary + per-event breakdown. */
    byte[] clubReportExcel(Long actingUserId, Long clubId);

    /** Excel (.xlsx) report for an event: summary + registrations + feedback. */
    byte[] eventReportExcel(Long actingUserId, Long eventId);
}
