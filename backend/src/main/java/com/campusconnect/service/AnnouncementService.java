package com.campusconnect.service;

import com.campusconnect.dto.request.AnnouncementRequest;
<<<<<<< HEAD
import com.campusconnect.dto.request.AnnouncementUpdateRequest;
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import com.campusconnect.dto.response.AnnouncementResponse;

import java.util.List;

public interface AnnouncementService {

    /** Post an announcement. Authorization and notification fan-out depend on the scope. */
    AnnouncementResponse create(Long actingUserId, AnnouncementRequest request);

<<<<<<< HEAD
    /** Edit an announcement's title/body/pinned flag (author or the relevant coordinator). */
    AnnouncementResponse update(Long actingUserId, Long announcementId, AnnouncementUpdateRequest request);

=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    void delete(Long actingUserId, Long announcementId);

    List<AnnouncementResponse> listByClub(Long clubId);

    List<AnnouncementResponse> listByEvent(Long eventId);

    List<AnnouncementResponse> listGeneral();

    List<AnnouncementResponse> feed();
}
