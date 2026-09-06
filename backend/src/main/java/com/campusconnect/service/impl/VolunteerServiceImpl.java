package com.campusconnect.service.impl;

import com.campusconnect.dto.request.RecruitVolunteerRequest;
import com.campusconnect.dto.request.VolunteerApplyRequest;
import com.campusconnect.dto.request.VolunteerTaskRequest;
import com.campusconnect.dto.response.VolunteerResponse;
import com.campusconnect.dto.response.VolunteerTaskResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;
import com.campusconnect.entity.Volunteer;
import com.campusconnect.entity.VolunteerTask;
import com.campusconnect.entity.enums.NotificationType;
import com.campusconnect.entity.enums.TaskStatus;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.ForbiddenException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.mapper.VolunteerMapper;
import com.campusconnect.mapper.VolunteerTaskMapper;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.repository.VolunteerRepository;
import com.campusconnect.repository.VolunteerTaskRepository;
import com.campusconnect.security.ClubAccess;
import com.campusconnect.service.NotificationService;
import com.campusconnect.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VolunteerServiceImpl implements VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final VolunteerTaskRepository volunteerTaskRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ClubAccess clubAccess;
    private final NotificationService notificationService;

    /* --------------------------------------------------------------- */
    /* Enrollment                                                       */
    /* --------------------------------------------------------------- */

    @Override
    @Transactional
    public VolunteerResponse apply(Long userId, VolunteerApplyRequest request) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.eventId()));

        if (volunteerRepository.existsByEventIdAndUserId(event.getId(), userId)) {
            throw new ConflictException("You have already applied to volunteer for this event.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Volunteer volunteer = volunteerRepository.save(Volunteer.builder()
                .event(event)
                .user(user)
                .approved(false)
                .role(trimToNull(request.preferredRole()))
                .build());

        // Best-effort: let the organiser know a new application arrived.
        User organiser = event.getCreatedBy();
        if (organiser != null && !organiser.getId().equals(userId)) {
            notificationService.notifyUser(
                    organiser.getId(),
                    NotificationType.GENERAL,
                    "New volunteer application",
                    user.getFullName() + " applied to volunteer for " + event.getTitle() + ".",
                    "/app/manage/events/" + event.getId());
        }
        return toResponseWithCounts(volunteer);
    }

    @Override
    @Transactional
    public VolunteerResponse recruit(Long actingUserId, Long eventId, RecruitVolunteerRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        clubAccess.requireAdminOrCoordinator(event.getClub().getId(), actingUserId);

        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.email()));

        if (volunteerRepository.existsByEventIdAndUserId(eventId, user.getId())) {
            throw new ConflictException(user.getFullName() + " is already a volunteer for this event.");
        }

        Volunteer volunteer = volunteerRepository.save(Volunteer.builder()
                .event(event)
                .user(user)
                .approved(true)
                .role(trimToNull(request.role()))
                .build());

        notificationService.notifyUser(
                user.getId(),
                NotificationType.GENERAL,
                "You're a volunteer",
                "You've been added as a volunteer for " + event.getTitle() + ".",
                "/app/volunteering");
        return toResponseWithCounts(volunteer);
    }

    @Override
    @Transactional
    public VolunteerResponse approve(Long actingUserId, Long volunteerId, String role) {
        Volunteer volunteer = getVolunteer(volunteerId);
        clubAccess.requireAdminOrCoordinator(volunteer.getEvent().getClub().getId(), actingUserId);

        volunteer.setApproved(true);
        if (StringUtils.hasText(role)) {
            volunteer.setRole(role.trim());
        }
        volunteer = volunteerRepository.save(volunteer);

        notificationService.notifyUser(
                volunteer.getUser().getId(),
                NotificationType.GENERAL,
                "Volunteer application approved",
                "You're confirmed as a volunteer for " + volunteer.getEvent().getTitle() + ".",
                "/app/volunteering");
        return toResponseWithCounts(volunteer);
    }

    @Override
    @Transactional
    public void remove(Long actingUserId, Long volunteerId) {
        Volunteer volunteer = getVolunteer(volunteerId);
        boolean self = volunteer.getUser().getId().equals(actingUserId);
        if (!self && !clubAccess.isAdminOrCoordinator(volunteer.getEvent().getClub().getId(), actingUserId)) {
            throw new ForbiddenException("You cannot remove this volunteer.");
        }
        // Tasks are FK-bound to the volunteer, so clear them first.
        volunteerTaskRepository.deleteByVolunteerId(volunteerId);
        volunteerRepository.delete(volunteer);
    }

    /* --------------------------------------------------------------- */
    /* Queries                                                          */
    /* --------------------------------------------------------------- */

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerResponse> listForEvent(Long actingUserId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        clubAccess.requireAdminOrCoordinator(event.getClub().getId(), actingUserId);
        return volunteerRepository.findByEventId(eventId).stream()
                .map(this::toResponseWithCounts)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerResponse> myVolunteering(Long userId) {
        return volunteerRepository.findByUserId(userId).stream()
                .map(this::toResponseWithCounts)
                .toList();
    }

    /* --------------------------------------------------------------- */
    /* Tasks                                                            */
    /* --------------------------------------------------------------- */

    @Override
    @Transactional
    public VolunteerTaskResponse assignTask(Long actingUserId, Long volunteerId, VolunteerTaskRequest request) {
        Volunteer volunteer = getVolunteer(volunteerId);
        clubAccess.requireAdminOrCoordinator(volunteer.getEvent().getClub().getId(), actingUserId);

        if (!volunteer.isApproved()) {
            throw new BadRequestException("Approve the volunteer before assigning tasks.");
        }

        VolunteerTask task = volunteerTaskRepository.save(VolunteerTask.builder()
                .volunteer(volunteer)
                .title(request.title().trim())
                .description(trimToNull(request.description()))
                .status(TaskStatus.PENDING)
                .dueAt(request.dueAt())
                .build());

        notificationService.notifyUser(
                volunteer.getUser().getId(),
                NotificationType.GENERAL,
                "New volunteer task",
                "New task for " + volunteer.getEvent().getTitle() + ": " + task.getTitle(),
                "/app/volunteering");
        return VolunteerTaskMapper.toResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskResponse> tasksForVolunteer(Long actingUserId, Long volunteerId) {
        Volunteer volunteer = getVolunteer(volunteerId);
        boolean self = volunteer.getUser().getId().equals(actingUserId);
        if (!self && !clubAccess.isAdminOrCoordinator(volunteer.getEvent().getClub().getId(), actingUserId)) {
            throw new ForbiddenException("You cannot view these tasks.");
        }
        return volunteerTaskRepository.findByVolunteerId(volunteerId).stream()
                .map(VolunteerTaskMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskResponse> tasksForEvent(Long actingUserId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        clubAccess.requireAdminOrCoordinator(event.getClub().getId(), actingUserId);
        return volunteerTaskRepository.findByVolunteerEventId(eventId).stream()
                .map(VolunteerTaskMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskResponse> myTasks(Long userId) {
        return volunteerTaskRepository.findByVolunteerUserId(userId).stream()
                .map(VolunteerTaskMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public VolunteerTaskResponse updateTaskStatus(Long actingUserId, Long taskId, TaskStatus status) {
        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("VolunteerTask", "id", taskId));
        Volunteer volunteer = task.getVolunteer();
        boolean self = volunteer.getUser().getId().equals(actingUserId);
        boolean manager = clubAccess.isAdminOrCoordinator(volunteer.getEvent().getClub().getId(), actingUserId);
        if (!self && !manager) {
            throw new ForbiddenException("You cannot update this task.");
        }

        TaskStatus previous = task.getStatus();
        task.setStatus(status);
        task = volunteerTaskRepository.save(task);

        // When a volunteer completes a task, let the organiser know.
        if (status == TaskStatus.COMPLETED && previous != TaskStatus.COMPLETED) {
            Event event = volunteer.getEvent();
            User organiser = event.getCreatedBy();
            if (organiser != null && !organiser.getId().equals(actingUserId)) {
                notificationService.notifyUser(
                        organiser.getId(),
                        NotificationType.GENERAL,
                        "Volunteer task completed",
                        volunteer.getUser().getFullName() + " completed \"" + task.getTitle()
                                + "\" for " + event.getTitle() + ".",
                        "/app/manage/events/" + event.getId());
            }
        }
        return VolunteerTaskMapper.toResponse(task);
    }

    @Override
    @Transactional
    public void removeTask(Long actingUserId, Long taskId) {
        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("VolunteerTask", "id", taskId));
        clubAccess.requireAdminOrCoordinator(task.getVolunteer().getEvent().getClub().getId(), actingUserId);
        volunteerTaskRepository.delete(task);
    }

    /* --------------------------------------------------------------- */
    /* Helpers                                                          */
    /* --------------------------------------------------------------- */

    private Volunteer getVolunteer(Long volunteerId) {
        return volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "id", volunteerId));
    }

    private VolunteerResponse toResponseWithCounts(Volunteer volunteer) {
        long total = volunteerTaskRepository.countByVolunteerId(volunteer.getId());
        long completed = volunteerTaskRepository.countByVolunteerIdAndStatus(volunteer.getId(), TaskStatus.COMPLETED);
        return VolunteerMapper.toResponse(volunteer, total, completed);
    }

    private static String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
