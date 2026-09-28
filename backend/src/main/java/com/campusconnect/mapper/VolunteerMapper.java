package com.campusconnect.mapper;

import com.campusconnect.dto.response.VolunteerResponse;
<<<<<<< HEAD
import com.campusconnect.entity.Club;
=======
import com.campusconnect.entity.Event;
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import com.campusconnect.entity.User;
import com.campusconnect.entity.Volunteer;

public final class VolunteerMapper {

    private VolunteerMapper() {
    }

    public static VolunteerResponse toResponse(Volunteer volunteer, long taskCount, long completedTaskCount) {
        if (volunteer == null) {
            return null;
        }
<<<<<<< HEAD
        User user = volunteer.getUser();
        Club club = volunteer.getClub();
        return new VolunteerResponse(
                volunteer.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getStudentId() : null,
                user != null ? user.getDepartment() : null,
                user != null ? user.getPhone() : null,
                user != null ? user.getProfilePhotoUrl() : null,
                club != null ? club.getId() : null,
                club != null ? club.getName() : null,
                volunteer.getStatus(),
                volunteer.getSkills(),
                volunteer.getAvailability(),
                volunteer.getTotalHours(),
                volunteer.isVolunteerLead(),
=======
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
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
                volunteer.getCreatedAt()
        );
    }
}
