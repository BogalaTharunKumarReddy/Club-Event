package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.common.PageRequests;
import com.campusconnect.common.PageResponse;
import com.campusconnect.dto.request.AdminUpdateRoleRequest;
import com.campusconnect.dto.request.AdminUpdateUserStatusRequest;
import com.campusconnect.dto.response.AdminUserResponse;
import com.campusconnect.dto.response.AuditLogResponse;
import com.campusconnect.dto.response.ClubResponse;
import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.dto.response.EventSummaryResponse;
import com.campusconnect.dto.response.PaymentResponse;
import com.campusconnect.dto.response.PlatformStatsResponse;
import com.campusconnect.entity.enums.AuditAction;
import com.campusconnect.entity.enums.EventStatus;
import com.campusconnect.entity.enums.PaymentStatus;
import com.campusconnect.entity.enums.Role;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.AdminService;
import com.campusconnect.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Full-platform administration API. Every method requires the ADMIN role
 * (enforced here by {@code @PreAuthorize} and again as a URL rule in
 * {@code SecurityConfig}). Admin actions are not scoped to a single club.
 */
@Tag(name = "Admin", description = "Full-platform administration (ADMIN role only)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;

    @Operation(summary = "Platform-wide statistics for the admin dashboard")
    @GetMapping("/stats")
    public ApiResponse<PlatformStatsResponse> stats() {
        return ApiResponse.success(adminService.platformStats());
    }

    // ----------------------------------------------------------------- users

    @Operation(summary = "List/search all users (optional free-text and role filter)")
    @GetMapping("/users")
    public ApiResponse<PageResponse<AdminUserResponse>> listUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(adminService.listUsers(q, role,
                PageRequests.of(page, size, Sort.by("createdAt").descending())));
    }

    @Operation(summary = "Get a single user")
    @GetMapping("/users/{id}")
    public ApiResponse<AdminUserResponse> getUser(@PathVariable Long id) {
        return ApiResponse.success(adminService.getUser(id));
    }

    @Operation(summary = "Change a user's platform role")
    @PatchMapping("/users/{id}/role")
    public ApiResponse<AdminUserResponse> updateRole(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long id,
                                                     @Valid @RequestBody AdminUpdateRoleRequest request) {
        return ApiResponse.success("Role updated.",
                adminService.updateRole(principal.getId(), id, request.role()));
    }

    @Operation(summary = "Enable or disable a user account")
    @PatchMapping("/users/{id}/status")
    public ApiResponse<AdminUserResponse> updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable Long id,
                                                       @Valid @RequestBody AdminUpdateUserStatusRequest request) {
        return ApiResponse.success("Account status updated.",
                adminService.updateStatus(principal.getId(), id, request.enabled()));
    }

    @Operation(summary = "Delete a user account")
    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adminService.deleteUser(principal.getId(), id);
        return ApiResponse.message("User deleted.");
    }

    // ----------------------------------------------------------------- clubs

    @Operation(summary = "List all clubs (including inactive)")
    @GetMapping("/clubs")
    public ApiResponse<PageResponse<ClubResponse>> listClubs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(adminService.listClubs(
                PageRequests.of(page, size, Sort.by("name").ascending())));
    }

    @Operation(summary = "Activate or deactivate a club")
    @PatchMapping("/clubs/{id}/status")
    public ApiResponse<ClubResponse> setClubActive(@AuthenticationPrincipal UserPrincipal principal,
                                                   @PathVariable Long id, @RequestParam boolean active) {
        return ApiResponse.success(active ? "Club activated." : "Club deactivated.",
                adminService.setClubActive(principal.getId(), id, active));
    }

    @Operation(summary = "Delete a club")
    @DeleteMapping("/clubs/{id}")
    public ApiResponse<Void> deleteClub(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adminService.deleteClub(principal.getId(), id);
        return ApiResponse.message("Club deleted.");
    }

    // ---------------------------------------------------------------- events

    @Operation(summary = "List all events (including drafts)")
    @GetMapping("/events")
    public ApiResponse<PageResponse<EventSummaryResponse>> listEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(adminService.listEvents(
                PageRequests.of(page, size, Sort.by("startDateTime").descending())));
    }

    @Operation(summary = "Override an event's status")
    @PatchMapping("/events/{id}/status")
    public ApiResponse<EventResponse> updateEventStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable Long id, @RequestParam EventStatus status) {
        return ApiResponse.success("Event status updated.",
                adminService.updateEventStatus(principal.getId(), id, status));
    }

    @Operation(summary = "Delete an event")
    @DeleteMapping("/events/{id}")
    public ApiResponse<Void> deleteEvent(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adminService.deleteEvent(principal.getId(), id);
        return ApiResponse.message("Event deleted.");
    }

    // -------------------------------------------------------------- payments

    @Operation(summary = "Platform-wide payment ledger (optional status filter)")
    @GetMapping("/payments")
    public ApiResponse<PageResponse<PaymentResponse>> listPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(adminService.listPayments(status,
                PageRequests.of(page, size, Sort.by("createdAt").descending())));
    }

    // ------------------------------------------------------------- audit log

    @Operation(summary = "Administrative audit trail (optional action filter), newest first")
    @GetMapping("/audit-logs")
    public ApiResponse<PageResponse<AuditLogResponse>> listAuditLogs(
            @RequestParam(required = false) AuditAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(auditService.list(action,
                PageRequests.of(page, size, Sort.by("createdAt").descending())));
    }
}
