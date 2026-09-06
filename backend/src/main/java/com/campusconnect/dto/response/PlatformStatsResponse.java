package com.campusconnect.dto.response;

import java.math.BigDecimal;

/**
 * Aggregated platform-wide statistics for the admin dashboard. All values are
 * computed on demand; nothing here is scoped to a single club.
 */
public record PlatformStatsResponse(
        long totalUsers,
        long students,
        long clubMembers,
        long coordinators,
        long admins,
        long totalClubs,
        long activeClubs,
        long totalEvents,
        long publishedEvents,
        long totalRegistrations,
        long successfulPayments,
        BigDecimal totalRevenue
) {
}
