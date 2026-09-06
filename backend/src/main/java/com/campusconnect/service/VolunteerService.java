package com.campusconnect.service;

import com.campusconnect.dto.request.RecruitVolunteerRequest;
import com.campusconnect.dto.request.VolunteerApplyRequest;
import com.campusconnect.dto.request.VolunteerTaskRequest;
import com.campusconnect.dto.response.VolunteerResponse;
import com.campusconnect.dto.response.VolunteerTaskResponse;
import com.campusconnect.entity.enums.TaskStatus;

import java.util.List;

/**
 * Volunteer recruitment and task tracking for events. Coordinators (or platform admins) manage the
 * roster and assign tasks; students apply to help and update the status of their own tasks.
 */
public interface VolunteerService {

    /* -------------------------- enrollment -------------------------- */

    /** A student applies to volunteer for an event (pending coordinator approval). */
    VolunteerResponse apply(Long userId, VolunteerApplyRequest request);

    /** Coordinator/admin directly recruits an existing user (auto-approved). */
    VolunteerResponse recruit(Long actingUserId, Long eventId, RecruitVolunteerRequest request);

    /** Coordinator/admin approves a pending volunteer, optionally assigning/overriding their role. */
    VolunteerResponse approve(Long actingUserId, Long volunteerId, String role);

    /** Coordinator/admin removes a volunteer, or the volunteer withdraws themselves. */
    void remove(Long actingUserId, Long volunteerId);

    /* --------------------------- queries ---------------------------- */

    /** Full volunteer roster for an event (coordinator/admin only). */
    List<VolunteerResponse> listForEvent(Long actingUserId, Long eventId);

    /** The calling user's own volunteer enrollments across all events. */
    List<VolunteerResponse> myVolunteering(Long userId);

    /* ---------------------------- tasks ----------------------------- */

    /** Coordinator/admin assigns a task to a volunteer. */
    VolunteerTaskResponse assignTask(Long actingUserId, Long volunteerId, VolunteerTaskRequest request);

    /** Tasks for a single volunteer (the volunteer themselves, or coordinator/admin). */
    List<VolunteerTaskResponse> tasksForVolunteer(Long actingUserId, Long volunteerId);

    /** Every volunteer task for an event (coordinator/admin only). */
    List<VolunteerTaskResponse> tasksForEvent(Long actingUserId, Long eventId);

    /** The calling user's own assigned tasks across all events. */
    List<VolunteerTaskResponse> myTasks(Long userId);

    /** Update a task's status (the assigned volunteer, or coordinator/admin). */
    VolunteerTaskResponse updateTaskStatus(Long actingUserId, Long taskId, TaskStatus status);

    /** Coordinator/admin deletes a task. */
    void removeTask(Long actingUserId, Long taskId);
}
