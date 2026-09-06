package com.campusconnect.mapper;

import com.campusconnect.dto.response.MediaResponse;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Media;
import com.campusconnect.entity.User;

public final class MediaMapper {

    private MediaMapper() {
    }

    public static MediaResponse toResponse(Media media) {
        if (media == null) {
            return null;
        }
        Event event = media.getEvent();
        Club club = media.getClub();
        User uploader = media.getUploadedBy();
        return new MediaResponse(
                media.getId(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                club != null ? club.getId() : null,
                club != null ? club.getName() : null,
                media.getUrl(),
                media.getMediaType(),
                media.getCaption(),
                uploader != null ? uploader.getId() : null,
                uploader != null ? uploader.getFullName() : null,
                media.getCreatedAt()
        );
    }
}
