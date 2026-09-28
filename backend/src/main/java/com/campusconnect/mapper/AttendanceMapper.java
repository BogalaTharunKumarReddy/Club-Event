package com.campusconnect.mapper;

import com.campusconnect.dto.response.AttendanceResponse;
import com.campusconnect.entity.Attendance;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Registration;
import com.campusconnect.entity.User;

public final class AttendanceMapper {

    private AttendanceMapper() {
    }

    public static AttendanceResponse toResponse(Attendance attendance) {
        if (attendance == null) {
            return null;
        }
        Registration registration = attendance.getRegistration();
        Event event = attendance.getEvent();
        User user = attendance.getUser();
        User markedBy = attendance.getMarkedBy();
        return new AttendanceResponse(
                attendance.getId(),
                registration != null ? registration.getId() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                registration != null ? registration.getTicketCode() : null,
                attendance.getMethod(),
                attendance.getCheckInAt(),
                attendance.getCheckOutAt(),
                markedBy != null ? markedBy.getId() : null,
                markedBy != null ? markedBy.getFullName() : null
        );
    }
}
