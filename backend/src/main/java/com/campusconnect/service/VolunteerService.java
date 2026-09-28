package com.campusconnect.service;

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
import com.campusconnect.dto.response.VolunteerTaskResponse;
=======
import com.campusconnect.dto.request.RecruitVolunteerRequest;
import com.campusconnect.dto.request.VolunteerApplyRequest;
import com.campusconnect.dto.request.VolunteerTaskRequest;
import com.campusconnect.dto.response.VolunteerResponse;
import com.campusconnect.dto.response.VolunteerTaskResponse;
import com.campusconnect.entity.enums.TaskStatus;
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

import java.util.List;

/**
<<<<<<< HEAD
 * Volunteer-facing operations plus the coordinator/member management surface.
 *
 * <p>Every {@code my*} method is scoped to the acting user's own volunteer
 * profile(s); event-scoped reads/writes additionally verify an assignment. The
 * coordinator/member methods enforce club coordinator (or admin) rights, or an
 * active member of the owning club for the delegated task/attendance actions.
 */
public interface VolunteerService {

    // ---- volunteer self-service ----

    /** The acting user's volunteer profiles across all clubs. */
    List<VolunteerResponse> myProfiles(Long userId);

    VolunteerResponse updateMyProfile(Long userId, VolunteerProfileUpdateRequest request);

    VolunteerDashboardResponse dashboard(Long userId);

    List<VolunteerAssignmentResponse> myEvents(Long userId);

    /** Accept an assignment offered to the acting volunteer. */
    VolunteerAssignmentResponse acceptAssignment(Long userId, Long assignmentId);

    List<VolunteerTaskResponse> myTasks(Long userId);

    VolunteerTaskResponse myTask(Long userId, Long taskId);

    VolunteerTaskResponse startTask(Long userId, Long taskId);

    VolunteerTaskResponse completeTask(Long userId, Long taskId, VolunteerTaskCompleteRequest request);

    List<VolunteerScheduleItemResponse> mySchedule(Long userId);

    VolunteerAttendanceResponse checkIn(Long userId, Long eventId);

    VolunteerAttendanceResponse checkOut(Long userId, Long eventId);

    List<VolunteerAttendanceResponse> myAttendance(Long userId);

    VolunteerHoursResponse myHours(Long userId);

    List<VolunteerAchievementResponse> myAchievements(Long userId);

    /** Participant check-in performed by a volunteer with check-in duty (QR scan). */
    VolunteerScanResponse scan(Long userId, VolunteerScanRequest request);

    // ---- coordinator / member management ----

    /**
     * Add an existing user (found by email) as an ACTIVE volunteer for a club.
     * Coordinator/admin only — this is the sole way a volunteer profile is created.
     */
    VolunteerResponse addVolunteer(Long actingUserId, Long clubId, VolunteerAddRequest request);

    /** Volunteers for a club (coordinator or admin). */
    List<VolunteerResponse> clubVolunteers(Long actingUserId, Long clubId);

    VolunteerResponse getVolunteer(Long actingUserId, Long volunteerId);

    VolunteerResponse approveVolunteer(Long actingUserId, Long volunteerId);

    VolunteerResponse rejectVolunteer(Long actingUserId, Long volunteerId);

    /** Volunteers assigned to an event (coordinator/admin, or active member of the club). */
    List<VolunteerAssignmentResponse> eventVolunteers(Long actingUserId, Long eventId);

    VolunteerAssignmentResponse assignToEvent(Long actingUserId, Long eventId, VolunteerAssignRequest request);

    VolunteerAssignmentResponse cancelAssignment(Long actingUserId, Long assignmentId);

    List<VolunteerTaskResponse> eventTasks(Long actingUserId, Long eventId);

    VolunteerTaskResponse createTask(Long actingUserId, Long eventId, VolunteerTaskCreateRequest request);

    List<VolunteerAttendanceResponse> eventVolunteerAttendance(Long actingUserId, Long eventId);
=======
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
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
}
