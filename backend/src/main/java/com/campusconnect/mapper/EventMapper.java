package com.campusconnect.mapper;

import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.dto.response.EventScheduleResponse;
import com.campusconnect.dto.response.EventSummaryResponse;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.EventSchedule;
import com.campusconnect.entity.User;

public final class EventMapper {

    private EventMapper() {
    }

    public static EventResponse toResponse(Event event, long registeredCount) {
        return toResponse(event, registeredCount, false);
    }

    public static EventResponse toResponse(Event event, long registeredCount, boolean saved) {
        if (event == null) {
            return null;
        }
        Club club = event.getClub();
        User creator = event.getCreatedBy();
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getBannerUrl(),
                event.getMode(),
                event.getVenue(),
                event.getOnlineUrl(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getRegistrationDeadline(),
                event.getCapacity(),
                event.getRules(),
                event.getInstructions(),
                event.getStatus(),
                event.isPaidEvent(),
                event.getFee(),
                event.isTeamEvent(),
                event.getMinTeamSize(),
                event.getMaxTeamSize(),
                event.isFeatured(),
                club != null ? club.getId() : null,
                club != null ? club.getName() : null,
                creator != null ? creator.getId() : null,
                creator != null ? creator.getFullName() : null,
                registeredCount,
                saved,
                event.getCreatedAt()
        );
    }

    public static EventSummaryResponse toSummary(Event event, long registeredCount) {
        return toSummary(event, registeredCount, false);
    }

    public static EventSummaryResponse toSummary(Event event, long registeredCount, boolean saved) {
        if (event == null) {
            return null;
        }
        Club club = event.getClub();
        return new EventSummaryResponse(
                event.getId(),
                event.getTitle(),
                event.getCategory(),
                event.getMode(),
                event.getVenue(),
                event.getBannerUrl(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getRegistrationDeadline(),
                event.getStatus(),
                event.isPaidEvent(),
                event.getFee(),
                event.isTeamEvent(),
                event.isFeatured(),
                event.getCapacity(),
                club != null ? club.getId() : null,
                club != null ? club.getName() : null,
                registeredCount,
                saved
        );
    }

    public static EventScheduleResponse toScheduleResponse(EventSchedule schedule) {
        if (schedule == null) {
            return null;
        }
        return new EventScheduleResponse(
                schedule.getId(),
                schedule.getTitle(),
                schedule.getDescription(),
                schedule.getStartDateTime(),
                schedule.getEndDateTime(),
                schedule.getDayNumber(),
                schedule.getSpeaker(),
                schedule.getVenue()
        );
    }
}
