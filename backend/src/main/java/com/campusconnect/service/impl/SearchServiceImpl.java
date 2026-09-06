package com.campusconnect.service.impl;

import com.campusconnect.dto.response.ClubResponse;
import com.campusconnect.dto.response.EventSummaryResponse;
import com.campusconnect.dto.response.GlobalSearchResponse;
import com.campusconnect.dto.response.UserResponse;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;
import com.campusconnect.entity.enums.RegistrationStatus;
import com.campusconnect.mapper.ClubMapper;
import com.campusconnect.mapper.EventMapper;
import com.campusconnect.mapper.UserMapper;
import com.campusconnect.repository.ClubFollowRepository;
import com.campusconnect.repository.ClubMemberRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.RegistrationRepository;
import com.campusconnect.repository.SavedEventRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.repository.spec.ClubSpecifications;
import com.campusconnect.repository.spec.EventSpecifications;
import com.campusconnect.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Cross-cutting global search. Rather than owning its own query logic it reuses
 * the same {@link EventSpecifications}/{@link ClubSpecifications} builders that
 * back the dedicated list endpoints, so search results honour exactly the same
 * visibility rules (e.g. only published events surface to the public).
 */
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    /** Ignore trivially short queries so a single stray character can't scan the whole table. */
    private static final int MIN_QUERY_LENGTH = 2;

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final SavedEventRepository savedEventRepository;
    private final ClubFollowRepository clubFollowRepository;
    private final ClubMemberRepository clubMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public GlobalSearchResponse search(String q, Long viewerId, boolean isAdmin, int limit) {
        if (q == null || q.trim().length() < MIN_QUERY_LENGTH) {
            return GlobalSearchResponse.empty();
        }
        String query = q.trim();
        int safeLimit = Math.max(1, Math.min(limit, 25));

        // ---- events (published-only for everyone; search never exposes drafts) ----
        Page<Event> eventPage = eventRepository.findAll(
                EventSpecifications.build(query, null, null, null, null, null, null, null, null, null, false),
                PageRequest.of(0, safeLimit, Sort.by("startDateTime").descending()));
        Set<Long> savedIds = viewerId != null ? savedEventRepository.findEventIdsByUserId(viewerId) : Set.of();
        List<EventSummaryResponse> events = eventPage.getContent().stream()
                .map(e -> EventMapper.toSummary(e, activeRegistrations(e.getId()), savedIds.contains(e.getId())))
                .toList();

        // ---- clubs (active only) ----
        Page<Club> clubPage = clubRepository.findAll(
                ClubSpecifications.build(query, null, true),
                PageRequest.of(0, safeLimit, Sort.by("name").ascending()));
        Set<Long> followedIds = viewerId != null ? clubFollowRepository.findClubIdsByUserId(viewerId) : Set.of();
        List<ClubResponse> clubs = clubPage.getContent().stream()
                .map(c -> clubResponse(c, followedIds.contains(c.getId())))
                .toList();

        // ---- users (admins only) ----
        List<UserResponse> users = List.of();
        long totalUsers = 0;
        if (isAdmin) {
            Page<User> userPage = userRepository.search(query, null,
                    PageRequest.of(0, safeLimit, Sort.by("fullName").ascending()));
            users = userPage.getContent().stream().map(UserMapper::toResponse).toList();
            totalUsers = userPage.getTotalElements();
        }

        return new GlobalSearchResponse(
                events, clubs, users,
                eventPage.getTotalElements(), clubPage.getTotalElements(), totalUsers);
    }

    private ClubResponse clubResponse(Club club, boolean following) {
        long members = clubMemberRepository.countByClubId(club.getId());
        long eventCount = eventRepository.countByClubId(club.getId());
        long followers = clubFollowRepository.countByClubId(club.getId());
        return ClubMapper.toResponse(club, members, eventCount, followers, following);
    }

    private long activeRegistrations(Long eventId) {
        return registrationRepository.countByEventId(eventId)
                - registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CANCELLED);
    }
}
