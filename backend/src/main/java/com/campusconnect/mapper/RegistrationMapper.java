package com.campusconnect.mapper;

import com.campusconnect.dto.response.RegistrationResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Registration;
import com.campusconnect.entity.Team;
import com.campusconnect.entity.User;

public final class RegistrationMapper {

    private RegistrationMapper() {
    }

    public static RegistrationResponse toResponse(Registration registration) {
        if (registration == null) {
            return null;
        }
        Event event = registration.getEvent();
        User user = registration.getUser();
        Team team = registration.getTeam();
        return new RegistrationResponse(
                registration.getId(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                team != null ? team.getId() : null,
                team != null ? team.getName() : null,
                registration.getType(),
                registration.getStatus(),
                registration.getTicketCode(),
                registration.getCreatedAt()
        );
    }
}
