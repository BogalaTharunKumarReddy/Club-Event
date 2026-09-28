package com.campusconnect.service.impl;

import com.campusconnect.dto.request.MediaRequest;
import com.campusconnect.dto.response.MediaResponse;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Media;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ForbiddenException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.mapper.MediaMapper;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.MediaRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.ClubAccess;
import com.campusconnect.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubAccess clubAccess;

    @Override
    @Transactional
    public MediaResponse create(Long actingUserId, MediaRequest request) {
        if ((request.eventId() == null) == (request.clubId() == null)) {
            throw new BadRequestException("Provide exactly one of eventId or clubId.");
        }

        User uploader = userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", actingUserId));

        Media.MediaBuilder builder = Media.builder()
                .url(request.url().trim())
                .mediaType(normaliseType(request.mediaType()))
                .caption(StringUtils.hasText(request.caption()) ? request.caption().trim() : null)
                .uploadedBy(uploader);

        if (request.eventId() != null) {
            Event event = eventRepository.findById(request.eventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.eventId()));
            clubAccess.requireAdminOrActiveMember(event.getClub().getId(), actingUserId);
            builder.event(event);
        } else {
            Club club = clubRepository.findById(request.clubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club", "id", request.clubId()));
            clubAccess.requireAdminOrActiveMember(club.getId(), actingUserId);
            builder.club(club);
        }

        Media saved = mediaRepository.save(builder.build());
        return MediaMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long actingUserId, Long mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));

        boolean isUploader = media.getUploadedBy() != null
                && media.getUploadedBy().getId().equals(actingUserId);
        if (!isUploader && !canManage(media, actingUserId)) {
            throw new ForbiddenException("You are not allowed to delete this media item.");
        }
        mediaRepository.delete(media);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaResponse> listByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", "id", eventId);
        }
        return mediaRepository.findByEventIdOrderByCreatedAtDesc(eventId).stream()
                .map(MediaMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaResponse> listByClub(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club", "id", clubId);
        }
        return mediaRepository.findByClubIdOrderByCreatedAtDesc(clubId).stream()
                .map(MediaMapper::toResponse)
                .toList();
    }

    // ---- helpers ----

    /** The uploader can always delete; otherwise an admin or coordinator of the owning club. */
    private boolean canManage(Media media, Long userId) {
        Long owningClubId = null;
        if (media.getEvent() != null && media.getEvent().getClub() != null) {
            owningClubId = media.getEvent().getClub().getId();
        } else if (media.getClub() != null) {
            owningClubId = media.getClub().getId();
        }
        return owningClubId != null && clubAccess.isAdminOrCoordinator(owningClubId, userId);
    }

    private String normaliseType(String raw) {
        if (!StringUtils.hasText(raw)) {
            return "IMAGE";
        }
        return raw.trim().toUpperCase();
    }
}
