package com.campusconnect.service.impl;

import com.campusconnect.dto.response.ClubDashboardResponse;
import com.campusconnect.dto.response.EventStatsResponse;
import com.campusconnect.entity.Attendance;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Feedback;
import com.campusconnect.entity.Payment;
import com.campusconnect.entity.Registration;
import com.campusconnect.entity.enums.EventStatus;
import com.campusconnect.entity.enums.PaymentStatus;
import com.campusconnect.entity.enums.RegistrationStatus;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.AttendanceRepository;
import com.campusconnect.repository.ClubMemberRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.FeedbackRepository;
import com.campusconnect.repository.PaymentRepository;
import com.campusconnect.repository.RegistrationRepository;
import com.campusconnect.entity.enums.MembershipStatus;
import com.campusconnect.security.ClubAccess;
import com.campusconnect.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final FeedbackRepository feedbackRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubAccess clubAccess;

    @Override
    @Transactional(readOnly = true)
    public ClubDashboardResponse clubDashboard(Long actingUserId, Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", "id", clubId));
        clubAccess.requireCoordinator(clubId, actingUserId);

        List<Event> events = eventRepository.findByClubId(clubId);
        List<EventStatsResponse> eventStats = events.stream().map(this::computeEventStats).toList();

        long upcoming = events.stream().filter(this::isUpcoming).count();
        long totalRegistrations = eventStats.stream().mapToLong(EventStatsResponse::activeRegistrations).sum();
        long totalAttendance = eventStats.stream().mapToLong(EventStatsResponse::attendanceCount).sum();
        BigDecimal totalRevenue = eventStats.stream()
                .map(EventStatsResponse::revenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long activeMembers = clubMemberRepository.findByClubId(clubId).stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .count();

        // Overall average rating across all feedback in the club.
        long ratingSum = 0;
        long ratingCount = 0;
        for (Event event : events) {
            for (Feedback f : feedbackRepository.findByEventId(event.getId())) {
                if (f.getRating() != null) {
                    ratingSum += f.getRating();
                    ratingCount++;
                }
            }
        }
        double averageRating = ratingCount == 0 ? 0.0
                : BigDecimal.valueOf((double) ratingSum / ratingCount).setScale(2, RoundingMode.HALF_UP).doubleValue();

        return new ClubDashboardResponse(
                club.getId(), club.getName(),
                events.size(), upcoming, activeMembers,
                totalRegistrations, totalAttendance, totalRevenue, averageRating,
                eventStats);
    }

    @Override
    @Transactional(readOnly = true)
    public EventStatsResponse eventStats(Long actingUserId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        clubAccess.requireCoordinator(event.getClub().getId(), actingUserId);
        return computeEventStats(event);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] clubReportExcel(Long actingUserId, Long clubId) {
        ClubDashboardResponse dashboard = clubDashboard(actingUserId, clubId);
        try (Workbook wb = new XSSFWorkbook()) {
            CellStyle header = headerStyle(wb);

            Sheet summary = wb.createSheet("Summary");
            writeRow(summary, 0, header, "Club", dashboard.clubName());
            writeRow(summary, 1, header, "Total events", String.valueOf(dashboard.totalEvents()));
            writeRow(summary, 2, header, "Upcoming events", String.valueOf(dashboard.upcomingEvents()));
            writeRow(summary, 3, header, "Active members", String.valueOf(dashboard.totalMembers()));
            writeRow(summary, 4, header, "Total registrations", String.valueOf(dashboard.totalRegistrations()));
            writeRow(summary, 5, header, "Total attendance", String.valueOf(dashboard.totalAttendance()));
            writeRow(summary, 6, header, "Total revenue", dashboard.totalRevenue().toPlainString());
            writeRow(summary, 7, header, "Average rating", String.valueOf(dashboard.averageRating()));
            autoSize(summary, 2);

            Sheet events = wb.createSheet("Events");
            String[] cols = {"Event", "Status", "Registrations", "Active", "Confirmed", "Waitlisted",
                    "Cancelled", "Attendance", "Attendance %", "Revenue", "Avg rating", "Feedback"};
            writeHeader(events, header, cols);
            int r = 1;
            for (EventStatsResponse e : dashboard.events()) {
                Row row = events.createRow(r++);
                int c = 0;
                cell(row, c++, e.eventTitle());
                cell(row, c++, e.status() != null ? e.status().name() : "");
                cell(row, c++, e.totalRegistrations());
                cell(row, c++, e.activeRegistrations());
                cell(row, c++, e.confirmed());
                cell(row, c++, e.waitlisted());
                cell(row, c++, e.cancelled());
                cell(row, c++, e.attendanceCount());
                cell(row, c++, e.attendanceRate());
                cell(row, c++, e.revenue() != null ? e.revenue().doubleValue() : 0.0);
                cell(row, c++, e.averageRating());
                cell(row, c, e.feedbackCount());
            }
            autoSize(events, cols.length);

            return toBytes(wb);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to build club report", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] eventReportExcel(Long actingUserId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        clubAccess.requireCoordinator(event.getClub().getId(), actingUserId);

        EventStatsResponse stats = computeEventStats(event);
        Set<Long> attendedUserIds = new HashSet<>();
        for (Attendance a : attendanceRepository.findByEventId(eventId)) {
            if (a.getUser() != null) {
                attendedUserIds.add(a.getUser().getId());
            }
        }

        try (Workbook wb = new XSSFWorkbook()) {
            CellStyle header = headerStyle(wb);

            Sheet summary = wb.createSheet("Summary");
            writeRow(summary, 0, header, "Event", stats.eventTitle());
            writeRow(summary, 1, header, "Status", stats.status() != null ? stats.status().name() : "");
            writeRow(summary, 2, header, "Total registrations", String.valueOf(stats.totalRegistrations()));
            writeRow(summary, 3, header, "Active registrations", String.valueOf(stats.activeRegistrations()));
            writeRow(summary, 4, header, "Confirmed", String.valueOf(stats.confirmed()));
            writeRow(summary, 5, header, "Waitlisted", String.valueOf(stats.waitlisted()));
            writeRow(summary, 6, header, "Cancelled", String.valueOf(stats.cancelled()));
            writeRow(summary, 7, header, "Attendance", String.valueOf(stats.attendanceCount()));
            writeRow(summary, 8, header, "Attendance %", String.valueOf(stats.attendanceRate()));
            writeRow(summary, 9, header, "Revenue", stats.revenue().toPlainString());
            writeRow(summary, 10, header, "Average rating", String.valueOf(stats.averageRating()));
            writeRow(summary, 11, header, "Feedback responses", String.valueOf(stats.feedbackCount()));
            autoSize(summary, 2);

            Sheet regs = wb.createSheet("Registrations");
            String[] cols = {"Name", "Email", "Type", "Status", "Registered at", "Attended"};
            writeHeader(regs, header, cols);
            int r = 1;
            for (Registration reg : registrationRepository.findByEventId(eventId)) {
                Row row = regs.createRow(r++);
                int c = 0;
                cell(row, c++, reg.getUser() != null ? reg.getUser().getFullName() : "");
                cell(row, c++, reg.getUser() != null ? reg.getUser().getEmail() : "");
                cell(row, c++, reg.getType() != null ? reg.getType().name() : "");
                cell(row, c++, reg.getStatus() != null ? reg.getStatus().name() : "");
                cell(row, c++, reg.getCreatedAt() != null ? reg.getCreatedAt().toString() : "");
                boolean attended = reg.getUser() != null && attendedUserIds.contains(reg.getUser().getId());
                cell(row, c, attended ? "Yes" : "No");
            }
            autoSize(regs, cols.length);

            Sheet fb = wb.createSheet("Feedback");
            String[] fbCols = {"Participant", "Rating", "Comment", "Suggestion", "Submitted at"};
            writeHeader(fb, header, fbCols);
            int fr = 1;
            for (Feedback f : feedbackRepository.findByEventId(eventId)) {
                Row row = fb.createRow(fr++);
                int c = 0;
                cell(row, c++, f.getUser() != null ? f.getUser().getFullName() : "");
                cell(row, c++, f.getRating() != null ? f.getRating() : 0);
                cell(row, c++, f.getComment() != null ? f.getComment() : "");
                cell(row, c++, f.getSuggestion() != null ? f.getSuggestion() : "");
                cell(row, c, f.getCreatedAt() != null ? f.getCreatedAt().toString() : "");
            }
            autoSize(fb, fbCols.length);

            return toBytes(wb);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to build event report", ex);
        }
    }

    // ---- computation ----

    private EventStatsResponse computeEventStats(Event event) {
        Long eventId = event.getId();
        long total = registrationRepository.countByEventId(eventId);
        long confirmed = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED);
        long registered = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.REGISTERED);
        long waitlisted = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.WAITLISTED);
        long cancelled = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CANCELLED);
        long active = total - cancelled;
        long attendance = attendanceRepository.countByEventId(eventId);
        double attendanceRate = active <= 0 ? 0.0
                : BigDecimal.valueOf((double) attendance / active * 100.0).setScale(1, RoundingMode.HALF_UP).doubleValue();

        BigDecimal revenue = BigDecimal.ZERO;
        for (Payment p : paymentRepository.findByEventId(eventId)) {
            if (p.getStatus() == PaymentStatus.SUCCESS && p.getAmount() != null) {
                revenue = revenue.add(p.getAmount());
            }
        }

        Double avg = feedbackRepository.averageRatingForEvent(eventId);
        double averageRating = avg == null ? 0.0
                : BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue();
        long feedbackCount = feedbackRepository.countByEventId(eventId);

        // confirmed reported as CONFIRMED + REGISTERED (both are "in", not waitlisted/cancelled)
        return new EventStatsResponse(
                eventId, event.getTitle(), event.getStatus(),
                total, active, confirmed + registered, waitlisted, cancelled,
                attendance, attendanceRate, revenue, averageRating, feedbackCount);
    }

    private boolean isUpcoming(Event event) {
        EventStatus status = event.getStatus();
        boolean liveStatus = status == EventStatus.PUBLISHED || status == EventStatus.UPCOMING;
        boolean future = event.getStartDateTime() != null && event.getStartDateTime().isAfter(LocalDateTime.now());
        return liveStatus && future;
    }

    // ---- POI helpers ----

    private static CellStyle headerStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private static void writeHeader(Sheet sheet, CellStyle style, String[] cols) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < cols.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(cols[i]);
            cell.setCellStyle(style);
        }
    }

    private static void writeRow(Sheet sheet, int rowIdx, CellStyle labelStyle, String label, String value) {
        Row row = sheet.createRow(rowIdx);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        row.createCell(1).setCellValue(value);
    }

    private static void cell(Row row, int idx, String value) {
        row.createCell(idx).setCellValue(value);
    }

    private static void cell(Row row, int idx, double value) {
        row.createCell(idx).setCellValue(value);
    }

    private static void cell(Row row, int idx, long value) {
        row.createCell(idx).setCellValue(value);
    }

    private static void autoSize(Sheet sheet, int columns) {
        for (int i = 0; i < columns; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private static byte[] toBytes(Workbook wb) throws Exception {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            wb.write(out);
            return out.toByteArray();
        }
    }
}
