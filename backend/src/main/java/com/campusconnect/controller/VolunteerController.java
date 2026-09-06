package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.request.RecruitVolunteerRequest;
import com.campusconnect.dto.request.UpdateTaskStatusRequest;
import com.campusconnect.dto.request.VolunteerApplyRequest;
import com.campusconnect.dto.request.VolunteerTaskRequest;
import com.campusconnect.dto.response.VolunteerResponse;
import com.campusconnect.dto.response.VolunteerTaskResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.VolunteerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteers", description = "Volunteer recruitment and task tracking for events")
@SecurityRequirement(name = "bearerAuth")
public class VolunteerController {

    private final VolunteerService volunteerService;

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
    public ApiResponse<List<VolunteerTaskResponse>> myTasks(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(volunteerService.myTasks(principal.getId()));
    }

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
    }
}
