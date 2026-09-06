package com.campusconnect.mapper;

import com.campusconnect.dto.response.AnnouncementResponse;
import com.campusconnect.entity.Announcement;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;

public final class AnnouncementMapper {

    private AnnouncementMapper() {
    }

    public static AnnouncementResponse toResponse(Announcement announcement) {
        if (announcement == null) {
            return null;
        }
        Club club = announcement.getClub();
        Event event = announcement.getEvent();
        User author = announcement.getAuthor();
        return new AnnouncementResponse(
                announcement.getId(),
                announcement.getScope(),
                club != null ? club.getId() : null,
                club != null ? club.getName() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                announcement.getTitle(),
                announcement.getContent(),
                announcement.isPinned(),
                author != null ? author.getId() : null,
                author != null ? author.getFullName() : null,
                announcement.getCreatedAt()
        );
    }
}
