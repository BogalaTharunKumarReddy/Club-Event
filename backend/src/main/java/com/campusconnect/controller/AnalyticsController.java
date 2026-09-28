package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.response.ClubDashboardResponse;
import com.campusconnect.dto.response.EventStatsResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Analytics", description = "Club and event dashboards and downloadable Excel reports")
public class AnalyticsController {

    private static final String XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final AnalyticsService analyticsService;

    @GetMapping("/club/{clubId}")
    @Operation(summary = "Club dashboard with aggregated statistics (coordinator only)")
    public ApiResponse<ClubDashboardResponse> clubDashboard(@AuthenticationPrincipal UserPrincipal principal,
                                                            @PathVariable Long clubId) {
        return ApiResponse.success(analyticsService.clubDashboard(principal.getId(), clubId));
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Event statistics (coordinator only)")
    public ApiResponse<EventStatsResponse> eventStats(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long eventId) {
        return ApiResponse.success(analyticsService.eventStats(principal.getId(), eventId));
    }

    @GetMapping("/club/{clubId}/report")
    @Operation(summary = "Download a club report as an Excel workbook (coordinator only)")
    public ResponseEntity<byte[]> clubReport(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable Long clubId) {
        byte[] xlsx = analyticsService.clubReportExcel(principal.getId(), clubId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"club-" + clubId + "-report.xlsx\"")
                .contentType(MediaType.parseMediaType(XLSX))
                .body(xlsx);
    }

    @GetMapping("/event/{eventId}/report")
    @Operation(summary = "Download an event report as an Excel workbook (coordinator only)")
    public ResponseEntity<byte[]> eventReport(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long eventId) {
        byte[] xlsx = analyticsService.eventReportExcel(principal.getId(), eventId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"event-" + eventId + "-report.xlsx\"")
                .contentType(MediaType.parseMediaType(XLSX))
                .body(xlsx);
    }
}
