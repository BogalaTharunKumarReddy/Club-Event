package com.campusconnect.dto.response;

import java.util.List;

/**
 * Aggregated volunteer-hours summary for the Hours page.
 *
 * @param totalHours      lifetime hours across all events
 * @param eventsSupported distinct events the volunteer was assigned to
 * @param tasksCompleted  count of COMPLETED tasks
 * @param attendancePct   present-or-late shifts as a percentage of all attendance rows (0-100)
 * @param avgHoursPerEvent totalHours / eventsSupported (0 when none)
 * @param byEvent         per-event hours breakdown
 * @param byMonth         per-month hours breakdown for the activity chart
 */
public record VolunteerHoursResponse(
        double totalHours,
        int eventsSupported,
        int tasksCompleted,
        int attendancePct,
        double avgHoursPerEvent,
        List<EventHours> byEvent,
        List<MonthHours> byMonth
) {
    public record EventHours(Long eventId, String eventTitle, double hours) {}

    /** month is an ISO year-month string, e.g. "2026-09". */
    public record MonthHours(String month, double hours) {}
}
