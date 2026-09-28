package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
<<<<<<< HEAD
import com.campusconnect.dto.request.VolunteerAddRequest;
import com.campusconnect.dto.request.VolunteerAssignRequest;
import com.campusconnect.dto.request.VolunteerProfileUpdateRequest;
import com.campusconnect.dto.request.VolunteerScanRequest;
import com.campusconnect.dto.request.VolunteerTaskCompleteRequest;
import com.campusconnect.dto.request.VolunteerTaskCreateRequest;
import com.campusconnect.dto.response.VolunteerAchievementResponse;
import com.campusconnect.dto.response.VolunteerAssignmentResponse;
import com.campusconnect.dto.response.VolunteerAttendanceResponse;
import com.campusconnect.dto.response.VolunteerDashboardResponse;
import com.campusconnect.dto.response.VolunteerHoursResponse;
import com.campusconnect.dto.response.VolunteerResponse;
import com.campusconnect.dto.response.VolunteerScanResponse;
import com.campusconnect.dto.response.VolunteerScheduleItemResponse;
=======
import com.campusconnect.dto.request.RecruitVolunteerRequest;
import com.campusconnect.dto.request.UpdateTaskStatusRequest;
import com.campusconnect.dto.request.VolunteerApplyRequest;
import com.campusconnect.dto.request.VolunteerTaskRequest;
import com.campusconnect.dto.response.VolunteerResponse;
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import com.campusconnect.dto.response.VolunteerTaskResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.VolunteerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
=======
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

<<<<<<< HEAD
/**
 * Volunteer role endpoints.
 *
 * <p>The {@code /me/**} surface is the volunteer's own view and is gated to the
 * VOLUNTEER role (defence-in-depth on top of per-record ownership checks in the
 * service). The coordinator/member management surface under {@code /clubs},
 * {@code /events} and {@code /{id}} enforces club coordinator/admin (or active
 * member) rights inside the service via {@code ClubAccess}.
 */
@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteers", description = "Volunteer profiles, assignments, tasks, attendance, hours and QR check-in")
=======
@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteers", description = "Volunteer recruitment and task tracking for events")
@SecurityRequirement(name = "bearerAuth")
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
public class VolunteerController {

    private final VolunteerService volunteerService;

<<<<<<< HEAD
    // ---------------------------- self-service ----------------------------

    @GetMapping("/me")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "My volunteer profiles across clubs")
    public ApiResponse<List<VolunteerResponse>> myProfiles(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myProfiles(principal.getId()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update my volunteer skills and availability")
    public ApiResponse<VolunteerResponse> updateMyProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody VolunteerProfileUpdateRequest request) {
        return ApiResponse.success("Profile updated",
                volunteerService.updateMyProfile(principal.getId(), request));
    }

    @GetMapping("/me/dashboard")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "My volunteer dashboard summary")
    public ApiResponse<VolunteerDashboardResponse> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.dashboard(principal.getId()));
    }

    @GetMapping("/me/events")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Events I'm assigned to")
    public ApiResponse<List<VolunteerAssignmentResponse>> myEvents(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myEvents(principal.getId()));
    }

    @PutMapping("/me/events/{assignmentId}/accept")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Accept an event assignment")
    public ApiResponse<VolunteerAssignmentResponse> acceptAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long assignmentId) {
        return ApiResponse.success("Assignment accepted",
                volunteerService.acceptAssignment(principal.getId(), assignmentId));
    }

    @GetMapping("/me/tasks")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "My volunteer tasks")
=======
    /* -------------------------- enrollment -------------------------- */

    @PostMapping("/apply")
    @Operation(summary = "Apply to volunteer for an event")
    public ApiResponse<VolunteerResponse> apply(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody VolunteerApplyRequest request) {
        return ApiResponse.success("Application submitted", volunteerService.apply(principal.getId(), request));
    }

    @PostMapping("/event/{eventId}/recruit")
    @Operation(summary = "Recruit an existing user as a volunteer (coordinator/admin)")
    public ApiResponse<VolunteerResponse> recruit(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable Long eventId,
                                                  @Valid @RequestBody RecruitVolunteerRequest request) {
        return ApiResponse.success("Volunteer added", volunteerService.recruit(principal.getId(), eventId, request));
    }

    @PostMapping("/{volunteerId}/approve")
    @Operation(summary = "Approve a pending volunteer (coordinator/admin)")
    public ApiResponse<VolunteerResponse> approve(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable Long volunteerId,
                                                  @RequestParam(required = false) String role) {
        return ApiResponse.success("Volunteer approved", volunteerService.approve(principal.getId(), volunteerId, role));
    }

    @DeleteMapping("/{volunteerId}")
    @Operation(summary = "Remove a volunteer, or withdraw your own application")
    public ApiResponse<Void> remove(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long volunteerId) {
        volunteerService.remove(principal.getId(), volunteerId);
        return ApiResponse.message("Volunteer removed");
    }

    /* --------------------------- queries ---------------------------- */

    @GetMapping("/event/{eventId}")
    @Operation(summary = "List the volunteer roster for an event (coordinator/admin)")
    public ApiResponse<List<VolunteerResponse>> listForEvent(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable Long eventId) {
        return ApiResponse.success(volunteerService.listForEvent(principal.getId(), eventId));
    }

    @GetMapping("/me")
    @Operation(summary = "List my volunteer enrollments")
    public ApiResponse<List<VolunteerResponse>> myVolunteering(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myVolunteering(principal.getId()));
    }

    /* ---------------------------- tasks ----------------------------- */

    @PostMapping("/{volunteerId}/tasks")
    @Operation(summary = "Assign a task to a volunteer (coordinator/admin)")
    public ApiResponse<VolunteerTaskResponse> assignTask(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable Long volunteerId,
                                                         @Valid @RequestBody VolunteerTaskRequest request) {
        return ApiResponse.success("Task assigned",
                volunteerService.assignTask(principal.getId(), volunteerId, request));
    }

    @GetMapping("/{volunteerId}/tasks")
    @Operation(summary = "List tasks for a volunteer (the volunteer, or coordinator/admin)")
    public ApiResponse<List<VolunteerTaskResponse>> tasksForVolunteer(@AuthenticationPrincipal UserPrincipal principal,
                                                                      @PathVariable Long volunteerId) {
        return ApiResponse.success(volunteerService.tasksForVolunteer(principal.getId(), volunteerId));
    }

    @GetMapping("/event/{eventId}/tasks")
    @Operation(summary = "List every volunteer task for an event (coordinator/admin)")
    public ApiResponse<List<VolunteerTaskResponse>> tasksForEvent(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @PathVariable Long eventId) {
        return ApiResponse.success(volunteerService.tasksForEvent(principal.getId(), eventId));
    }

    @GetMapping("/me/tasks")
    @Operation(summary = "List my assigned volunteer tasks")
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    public ApiResponse<List<VolunteerTaskResponse>> myTasks(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myTasks(principal.getId()));
    }

<<<<<<< HEAD
    @GetMapping("/me/tasks/{id}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "A single task of mine")
    public ApiResponse<VolunteerTaskResponse> myTask(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long id) {
        return ApiResponse.success(volunteerService.myTask(principal.getId(), id));
    }

    @PutMapping("/me/tasks/{id}/start")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Start a task")
    public ApiResponse<VolunteerTaskResponse> startTask(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable Long id) {
        return ApiResponse.success("Task started", volunteerService.startTask(principal.getId(), id));
    }

    @PutMapping("/me/tasks/{id}/complete")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Complete a task with optional notes")
    public ApiResponse<VolunteerTaskResponse> completeTask(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable Long id,
                                                           @Valid @RequestBody(required = false)
                                                           VolunteerTaskCompleteRequest request) {
        return ApiResponse.success("Task completed",
                volunteerService.completeTask(principal.getId(), id, request));
    }

    @GetMapping("/me/schedule")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "My shift schedule")
    public ApiResponse<List<VolunteerScheduleItemResponse>> mySchedule(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.mySchedule(principal.getId()));
    }

    @PostMapping("/me/attendance/check-in")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mark my own volunteer check-in for an event")
    public ApiResponse<VolunteerAttendanceResponse> checkIn(@AuthenticationPrincipal UserPrincipal principal,
                                                            @org.springframework.web.bind.annotation.RequestParam
                                                            Long eventId) {
        return ApiResponse.success("Checked in", volunteerService.checkIn(principal.getId(), eventId));
    }

    @PostMapping("/me/attendance/check-out")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mark my own volunteer check-out for an event")
    public ApiResponse<VolunteerAttendanceResponse> checkOut(@AuthenticationPrincipal UserPrincipal principal,
                                                             @org.springframework.web.bind.annotation.RequestParam
                                                             Long eventId) {
        return ApiResponse.success("Checked out", volunteerService.checkOut(principal.getId(), eventId));
    }

    @GetMapping("/me/attendance")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "My volunteer attendance history")
    public ApiResponse<List<VolunteerAttendanceResponse>> myAttendance(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myAttendance(principal.getId()));
    }

    @GetMapping("/me/hours")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "My volunteer-hours summary")
    public ApiResponse<VolunteerHoursResponse> myHours(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myHours(principal.getId()));
    }

    @GetMapping("/me/achievements")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "My volunteer achievements/badges")
    public ApiResponse<List<VolunteerAchievementResponse>> myAchievements(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myAchievements(principal.getId()));
    }

    @PostMapping("/scan")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Scan a participant ticket QR to check them in (requires check-in duty)")
    public ApiResponse<VolunteerScanResponse> scan(@AuthenticationPrincipal UserPrincipal principal,
                                                   @Valid @RequestBody VolunteerScanRequest request) {
        VolunteerScanResponse result = volunteerService.scan(principal.getId(), request);
        return ApiResponse.success(result.message(), result);
    }

    // ----------------------- coordinator / member -----------------------

    @GetMapping("/clubs/{clubId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List a club's volunteers (coordinator or admin)")
    public ApiResponse<List<VolunteerResponse>> clubVolunteers(@AuthenticationPrincipal UserPrincipal principal,
                                                               @PathVariable Long clubId) {
        return ApiResponse.success(volunteerService.clubVolunteers(principal.getId(), clubId));
    }

    @PostMapping("/clubs/{clubId}")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add a user (by email) as a volunteer for a club (active member, coordinator or admin)")
    public ApiResponse<VolunteerResponse> addVolunteer(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable Long clubId,
                                                       @Valid @RequestBody VolunteerAddRequest request) {
        return ApiResponse.success("Volunteer added",
                volunteerService.addVolunteer(principal.getId(), clubId, request));
    }

    @GetMapping("/{volunteerId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get a single volunteer (coordinator or admin)")
    public ApiResponse<VolunteerResponse> getVolunteer(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable Long volunteerId) {
        return ApiResponse.success(volunteerService.getVolunteer(principal.getId(), volunteerId));
    }

    @PutMapping("/{volunteerId}/approve")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Approve a volunteer (coordinator or admin)")
    public ApiResponse<VolunteerResponse> approve(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable Long volunteerId) {
        return ApiResponse.success("Volunteer approved",
                volunteerService.approveVolunteer(principal.getId(), volunteerId));
    }

    @PutMapping("/{volunteerId}/reject")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Reject/deactivate a volunteer (coordinator or admin)")
    public ApiResponse<VolunteerResponse> reject(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long volunteerId) {
        return ApiResponse.success("Volunteer rejected",
                volunteerService.rejectVolunteer(principal.getId(), volunteerId));
    }

    @GetMapping("/events/{eventId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Volunteers assigned to an event (coordinator/admin or active member)")
    public ApiResponse<List<VolunteerAssignmentResponse>> eventVolunteers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId) {
        return ApiResponse.success(volunteerService.eventVolunteers(principal.getId(), eventId));
    }

    @PostMapping("/events/{eventId}/assign")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Assign a volunteer to an event (coordinator or admin)")
    public ApiResponse<VolunteerAssignmentResponse> assign(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable Long eventId,
                                                           @Valid @RequestBody VolunteerAssignRequest request) {
        return ApiResponse.success("Volunteer assigned",
                volunteerService.assignToEvent(principal.getId(), eventId, request));
    }

    @PutMapping("/assignments/{assignmentId}/cancel")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cancel a volunteer assignment (coordinator or admin)")
    public ApiResponse<VolunteerAssignmentResponse> cancelAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long assignmentId) {
        return ApiResponse.success("Assignment cancelled",
                volunteerService.cancelAssignment(principal.getId(), assignmentId));
    }

    @GetMapping("/events/{eventId}/tasks")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Volunteer tasks for an event (coordinator/admin or active member)")
    public ApiResponse<List<VolunteerTaskResponse>> eventTasks(@AuthenticationPrincipal UserPrincipal principal,
                                                               @PathVariable Long eventId) {
        return ApiResponse.success(volunteerService.eventTasks(principal.getId(), eventId));
    }

    @PostMapping("/events/{eventId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a volunteer task for an event (coordinator/admin or active member)")
    public ApiResponse<VolunteerTaskResponse> createTask(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable Long eventId,
                                                         @Valid @RequestBody VolunteerTaskCreateRequest request) {
        return ApiResponse.success("Task created",
                volunteerService.createTask(principal.getId(), eventId, request));
    }

    @GetMapping("/events/{eventId}/attendance")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Volunteer attendance for an event (coordinator/admin or active member)")
    public ApiResponse<List<VolunteerAttendanceResponse>> eventVolunteerAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId) {
        return ApiResponse.success(volunteerService.eventVolunteerAttendance(principal.getId(), eventId));
=======
    @PatchMapping("/tasks/{taskId}/status")
    @Operation(summary = "Update a volunteer task's status")
    public ApiResponse<VolunteerTaskResponse> updateTaskStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                               @PathVariable Long taskId,
                                                               @Valid @RequestBody UpdateTaskStatusRequest request) {
        return ApiResponse.success("Task updated",
                volunteerService.updateTaskStatus(principal.getId(), taskId, request.status()));
    }

    @DeleteMapping("/tasks/{taskId}")
    @Operation(summary = "Delete a volunteer task (coordinator/admin)")
    public ApiResponse<Void> removeTask(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable Long taskId) {
        volunteerService.removeTask(principal.getId(), taskId);
        return ApiResponse.message("Task deleted");
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    }
}
