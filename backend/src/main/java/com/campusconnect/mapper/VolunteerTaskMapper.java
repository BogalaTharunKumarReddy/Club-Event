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
        Event event = volunteer != null ? volunteer.getEvent() : null;
        User assignee = volunteer != null ? volunteer.getUser() : null;
        return new VolunteerTaskResponse(
                task.getId(),
                volunteer != null ? volunteer.getId() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                assignee != null ? assignee.getId() : null,
                assignee != null ? assignee.getFullName() : null,
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueAt(),
                task.getCreatedAt()
        );
    }
}
