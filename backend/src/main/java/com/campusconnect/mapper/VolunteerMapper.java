package com.campusconnect.mapper;

import com.campusconnect.dto.response.VolunteerResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;
import com.campusconnect.entity.Volunteer;

public final class VolunteerMapper {

    private VolunteerMapper() {
    }

    public static VolunteerResponse toResponse(Volunteer volunteer, long taskCount, long completedTaskCount) {
        if (volunteer == null) {
            return null;
        }
        Event event = volunteer.getEvent();
        User user = volunteer.getUser();
        return new VolunteerResponse(
                volunteer.getId(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                user != null ? user.getEmail() : null,
                volunteer.isApproved(),
                volunteer.getRole(),
                taskCount,
                completedTaskCount,
                volunteer.getCreatedAt()
        );
    }
}
