package com.campusconnect.dto.response;

import java.util.List;

/** Everything the volunteer dashboard needs in a single call. */
public record VolunteerDashboardResponse(
        String fullName,
        boolean hasProfile,
        String status,
        int assignedEvents,
        long pendingTasks,
        long inProgressTasks,
        long completedTasks,
        double totalHours,
        int attendancePct,
        VolunteerAssignmentResponse todaysAssignment,
        List<VolunteerAssignmentResponse> upcomingShifts,
        List<VolunteerTaskResponse> recentTasks
) {
}
