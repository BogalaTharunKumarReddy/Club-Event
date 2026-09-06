package com.campusconnect.service;

import com.campusconnect.common.PageResponse;
import com.campusconnect.dto.request.RegistrationRequest;
import com.campusconnect.dto.response.RegistrationResponse;
import org.springframework.data.domain.Pageable;

public interface RegistrationService {

    RegistrationResponse register(Long userId, RegistrationRequest request);

    void cancel(Long userId, Long registrationId);

    RegistrationResponse getMyRegistrationForEvent(Long userId, Long eventId);

    PageResponse<RegistrationResponse> myRegistrations(Long userId, Pageable pageable);

    PageResponse<RegistrationResponse> eventRegistrations(Long actingUserId, Long eventId, Pageable pageable);

    /** Returns the QR-code PNG for a ticket. Accessible to the ticket owner or a club coordinator. */
    byte[] ticketQr(Long userId, Long registrationId);

    /**
     * Move waitlisted attendees into any free seats for the given event, oldest first, notifying each
     * promoted attendee. Called when a seat is released or an event's capacity is raised. No-op when the
     * event has no waitlist or no free seats.
     */
    void promoteWaitlist(Long eventId);
}
