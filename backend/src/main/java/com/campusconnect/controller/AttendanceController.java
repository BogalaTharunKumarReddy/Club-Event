package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.request.CheckInRequest;
import com.campusconnect.dto.request.ManualCheckInRequest;
import com.campusconnect.dto.response.AttendanceResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Attendance", description = "QR and manual check-in / check-out")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Check in a participant by scanning their ticket QR code (club member only)")
    public ApiResponse<AttendanceResponse> checkInByTicket(@AuthenticationPrincipal UserPrincipal principal,
                                                           @Valid @RequestBody CheckInRequest request) {
        return ApiResponse.success("Checked in", attendanceService.checkInByTicket(principal.getId(), request));
    }

    @PostMapping("/manual")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Manually check in a participant by registration id (club member only)")
    public ApiResponse<AttendanceResponse> checkInManual(@AuthenticationPrincipal UserPrincipal principal,
                                                         @Valid @RequestBody ManualCheckInRequest request) {
        return ApiResponse.success("Checked in", attendanceService.checkInManual(principal.getId(), request));
    }

    @PostMapping("/{id}/check-out")
    @Operation(summary = "Check out a participant (club member only)")
    public ApiResponse<AttendanceResponse> checkOut(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable Long id) {
        return ApiResponse.success("Checked out", attendanceService.checkOut(principal.getId(), id));
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "List attendance for an event (club member only)")
    public ApiResponse<List<AttendanceResponse>> eventAttendance(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable Long eventId) {
        return ApiResponse.success(attendanceService.eventAttendance(principal.getId(), eventId));
    }

    @GetMapping("/me")
    @Operation(summary = "List my attendance records")
    public ApiResponse<List<AttendanceResponse>> myAttendance(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(attendanceService.myAttendance(principal.getId()));
    }
}
