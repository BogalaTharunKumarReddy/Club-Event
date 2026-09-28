package com.campusconnect.service;

import com.campusconnect.dto.request.CheckInRequest;
import com.campusconnect.dto.request.ManualCheckInRequest;
import com.campusconnect.dto.response.AttendanceResponse;

import java.util.List;

public interface AttendanceService {

    /** QR-based check-in: resolves the registration from the scanned ticket code. */
    AttendanceResponse checkInByTicket(Long actingUserId, CheckInRequest request);

    /** Manual check-in performed by a club member. */
    AttendanceResponse checkInManual(Long actingUserId, ManualCheckInRequest request);

    AttendanceResponse checkOut(Long actingUserId, Long attendanceId);

    List<AttendanceResponse> eventAttendance(Long actingUserId, Long eventId);

    List<AttendanceResponse> myAttendance(Long userId);
}
