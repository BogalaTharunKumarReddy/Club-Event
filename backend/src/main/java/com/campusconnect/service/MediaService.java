package com.campusconnect.service;

import com.campusconnect.dto.request.MediaRequest;
import com.campusconnect.dto.response.MediaResponse;

import java.util.List;

public interface MediaService {

    /**
     * Add a media item to an event or club gallery. The request must reference
     * exactly one of eventId/clubId; the caller must be a platform admin or an
     * active member of the owning club.
     */
    MediaResponse create(Long actingUserId, MediaRequest request);

    /** Delete a media item (the uploader, or an admin/coordinator of the owning club). */
    void delete(Long actingUserId, Long mediaId);

    List<MediaResponse> listByEvent(Long eventId);

    List<MediaResponse> listByClub(Long clubId);
}
