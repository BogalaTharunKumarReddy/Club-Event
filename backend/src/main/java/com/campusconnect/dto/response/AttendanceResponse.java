package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.AttendanceMethod;

import java.time.Instant;

public record AttendanceResponse(
        Long id,
        Long registrationId,
        Long eventId,
        String eventTitle,
        Long userId,
        String userName,
        String ticketCode,
        AttendanceMethod method,
        Instant checkInAt,
        Instant checkOutAt,
        Long markedById,
        String markedByName
) {
}
