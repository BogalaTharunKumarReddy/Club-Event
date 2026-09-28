package com.campusconnect.service;

import com.campusconnect.common.PageResponse;
import com.campusconnect.dto.response.AdminUserResponse;
import com.campusconnect.dto.response.ClubResponse;
import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.dto.response.EventSummaryResponse;
import com.campusconnect.dto.response.PaymentResponse;
import com.campusconnect.dto.response.PlatformStatsResponse;
import com.campusconnect.entity.enums.EventStatus;
import com.campusconnect.entity.enums.PaymentStatus;
import com.campusconnect.entity.enums.Role;
import org.springframework.data.domain.Pageable;

/**
 * Full-platform administration. Unlike coordinator operations, these are not
 * scoped to a single club — an ADMIN acts across all users, clubs and events.
 */
public interface AdminService {

    PlatformStatsResponse platformStats();

    // ---- users ----
    PageResponse<AdminUserResponse> listUsers(String q, Role role, Pageable pageable);

    AdminUserResponse getUser(Long id);

    AdminUserResponse updateRole(Long actingAdminId, Long userId, Role role);

    AdminUserResponse updateStatus(Long actingAdminId, Long userId, boolean enabled);

    void deleteUser(Long actingAdminId, Long userId);

    // ---- clubs ----
    PageResponse<ClubResponse> listClubs(Pageable pageable);

    ClubResponse setClubActive(Long actingAdminId, Long clubId, boolean active);

    void deleteClub(Long actingAdminId, Long clubId);

    // ---- events ----
    PageResponse<EventSummaryResponse> listEvents(Pageable pageable);

    EventResponse updateEventStatus(Long actingAdminId, Long eventId, EventStatus status);

    void deleteEvent(Long actingAdminId, Long eventId);

    // ---- payments ----
    /** Platform-wide payment ledger, optionally filtered by status. */
    PageResponse<PaymentResponse> listPayments(PaymentStatus status, Pageable pageable);
}
