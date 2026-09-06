package com.campusconnect.dto.response;

import java.util.List;

/**
 * Aggregated result of a single free-text query across the platform.
 *
 * <p>Each list holds only the top few matches per type (the "limit" applied by
 * {@code SearchService}); the {@code total*} counts report how many matched
 * overall, so the UI can render "View all N results" affordances. The
 * {@code users} list is populated only for platform admins — students,
 * members and coordinators never see a people directory through search.
 */
public record GlobalSearchResponse(
        List<EventSummaryResponse> events,
        List<ClubResponse> clubs,
        List<UserResponse> users,
        long totalEvents,
        long totalClubs,
        long totalUsers
) {
    /** Empty result — used for blank queries so the UI has a stable shape to render. */
    public static GlobalSearchResponse empty() {
        return new GlobalSearchResponse(List.of(), List.of(), List.of(), 0, 0, 0);
    }
}
