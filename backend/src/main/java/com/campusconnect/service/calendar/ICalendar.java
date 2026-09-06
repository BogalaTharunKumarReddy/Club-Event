package com.campusconnect.service.calendar;

import com.campusconnect.entity.Event;
import com.campusconnect.entity.enums.EventMode;
import com.campusconnect.entity.enums.EventStatus;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds an RFC 5545 iCalendar (.ics) document for a single event so attendees can add it to
 * Apple Calendar, Outlook, Google Calendar, etc.
 *
 * <p>Events are stored as naive {@link LocalDateTime}s (no zone), so the calendar entry uses
 * <em>floating</em> local time — the event shows at the same wall-clock time in every viewer's
 * calendar, matching how the times are displayed everywhere else in the app. Only {@code DTSTAMP}
 * (the generation instant) is emitted in UTC, as the spec requires.
 */
public final class ICalendar {

    /** Floating local time: no trailing 'Z', no TZID — interpreted in the viewer's own zone. */
    private static final DateTimeFormatter LOCAL = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
    /** UTC form used only for DTSTAMP. */
    private static final DateTimeFormatter UTC = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
    private static final String CRLF = "\r\n";
    private static final int FOLD_LIMIT = 75;

    private ICalendar() {
    }

    /** Render the given event as a UTF-8 encoded {@code .ics} document. */
    public static byte[] forEvent(Event event) {
        List<String> lines = new ArrayList<>();
        lines.add("BEGIN:VCALENDAR");
        lines.add("VERSION:2.0");
        lines.add("PRODID:-//CampusConnect//Event Calendar//EN");
        lines.add("CALSCALE:GREGORIAN");
        lines.add("METHOD:PUBLISH");

        lines.add("BEGIN:VEVENT");
        lines.add("UID:event-" + event.getId() + "@campusconnect");
        lines.add("DTSTAMP:" + UTC.format(Instant.now().atOffset(ZoneOffset.UTC)));
        lines.add("DTSTART:" + LOCAL.format(event.getStartDateTime()));
        lines.add("DTEND:" + LOCAL.format(endOf(event)));
        lines.add("SUMMARY:" + escape(event.getTitle()));

        String description = buildDescription(event);
        if (!description.isBlank()) {
            lines.add("DESCRIPTION:" + escape(description));
        }
        String location = locationOf(event);
        if (location != null && !location.isBlank()) {
            lines.add("LOCATION:" + escape(location));
        }
        if (event.getOnlineUrl() != null && !event.getOnlineUrl().isBlank()) {
            // URL is emitted verbatim (no text escaping) per the spec's URI value type.
            lines.add("URL:" + event.getOnlineUrl().trim());
        }
        lines.add("STATUS:" + statusOf(event.getStatus()));
        lines.add("END:VEVENT");
        lines.add("END:VCALENDAR");

        StringBuilder out = new StringBuilder();
        for (String line : lines) {
            out.append(fold(line)).append(CRLF);
        }
        return out.toString().getBytes(StandardCharsets.UTF_8);
    }

    /** A sensible, filesystem-safe filename such as {@code hackathon-2026.ics}. */
    public static String fileName(Event event) {
        String slug = event.getTitle() == null ? "" : event.getTitle().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        if (slug.isBlank()) {
            slug = "event-" + event.getId();
        }
        if (slug.length() > 60) {
            slug = slug.substring(0, 60).replaceAll("-+$", "");
        }
        return slug + ".ics";
    }

    /** End time defaults to one hour after the start when an event somehow lacks an explicit end. */
    private static LocalDateTime endOf(Event event) {
        LocalDateTime end = event.getEndDateTime();
        if (end == null || !end.isAfter(event.getStartDateTime())) {
            return event.getStartDateTime().plusHours(1);
        }
        return end;
    }

    private static String buildDescription(Event event) {
        StringBuilder sb = new StringBuilder();
        if (event.getDescription() != null && !event.getDescription().isBlank()) {
            sb.append(event.getDescription().trim());
        }
        if (event.getClub() != null && event.getClub().getName() != null) {
            if (sb.length() > 0) {
                sb.append("\n\n");
            }
            sb.append("Hosted by ").append(event.getClub().getName().trim());
        }
        return sb.toString();
    }

    private static String locationOf(Event event) {
        if (event.getMode() == EventMode.ONLINE) {
            return event.getOnlineUrl() != null && !event.getOnlineUrl().isBlank()
                    ? event.getOnlineUrl().trim()
                    : "Online";
        }
        return event.getVenue();
    }

    private static String statusOf(EventStatus status) {
        if (status == EventStatus.CANCELLED) {
            return "CANCELLED";
        }
        if (status == EventStatus.DRAFT) {
            return "TENTATIVE";
        }
        return "CONFIRMED";
    }

    /**
     * Escape a text value per RFC 5545 §3.3.11: backslash, semicolon and comma are escaped, and
     * CR/LF become the literal {@code \n} sequence.
     */
    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\r\n", "\\n")
                .replace("\r", "\\n")
                .replace("\n", "\\n");
    }

    /**
     * Fold a content line to a maximum of 75 octets per RFC 5545 §3.1, splitting on character
     * boundaries (never mid-UTF-8-char) and prefixing continuation lines with a single space.
     */
    private static String fold(String line) {
        if (line.getBytes(StandardCharsets.UTF_8).length <= FOLD_LIMIT) {
            return line;
        }
        StringBuilder folded = new StringBuilder();
        int lineBytes = 0;
        boolean continuation = false;
        for (int i = 0; i < line.length(); ) {
            int codePoint = line.codePointAt(i);
            int charCount = Character.charCount(codePoint);
            String piece = line.substring(i, i + charCount);
            int pieceBytes = piece.getBytes(StandardCharsets.UTF_8).length;
            // A continuation line opens with a space, which counts toward its own 75-octet budget.
            int budget = continuation ? FOLD_LIMIT - 1 : FOLD_LIMIT;
            if (lineBytes + pieceBytes > budget) {
                folded.append(CRLF).append(' ');
                lineBytes = 1; // the leading space already consumed one octet
                continuation = true;
            }
            folded.append(piece);
            lineBytes += pieceBytes;
            i += charCount;
        }
        return folded.toString();
    }
}
