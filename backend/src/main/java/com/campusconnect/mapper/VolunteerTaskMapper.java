package com.campusconnect.mapper;

import com.campusconnect.dto.response.VolunteerTaskResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;
import com.campusconnect.entity.Volunteer;
import com.campusconnect.entity.VolunteerTask;

public final class VolunteerTaskMapper {

    private VolunteerTaskMapper() {
    }

    public static VolunteerTaskResponse toResponse(VolunteerTask task) {
        if (task == null) {
            return null;
        }
        Volunteer volunteer = task.getVolunteer();
<<<<<<< HEAD
        Event event = task.getEvent();
=======
        Event event = volunteer != null ? volunteer.getEvent() : null;
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        User assignee = volunteer != null ? volunteer.getUser() : null;
        return new VolunteerTaskResponse(
                task.getId(),
                volunteer != null ? volunteer.getId() : null,
<<<<<<< HEAD
            assignee != null ? assignee.getFullName() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
            task.getAssignedBy() != null ? task.getAssignedBy().getFullName() : null,
                task.getTitle(),
                task.getDescription(),
            task.getInstructions(),
            task.getLocation(),
            task.getPriority(),
            task.getStartTime(),
            task.getEndTime(),
                task.getStatus(),
            task.getStartedAt(),
            task.getCompletedAt(),
            task.getCompletionNotes(),
=======
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                assignee != null ? assignee.getId() : null,
                assignee != null ? assignee.getFullName() : null,
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueAt(),
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
                task.getCreatedAt()
        );
    }
}
