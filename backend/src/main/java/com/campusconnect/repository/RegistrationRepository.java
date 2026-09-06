package com.campusconnect.repository;

import com.campusconnect.entity.Registration;
import com.campusconnect.entity.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    Optional<Registration> findByTicketCode(String ticketCode);

    Page<Registration> findByUserId(Long userId, Pageable pageable);

    Page<Registration> findByEventId(Long eventId, Pageable pageable);

    List<Registration> findByEventId(Long eventId);

    List<Registration> findByTeamId(Long teamId);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    long countByEventId(Long eventId);

    /** Seats currently held (or awaiting payment) — used for capacity checks and waitlist promotion. */
    long countByEventIdAndStatusIn(Long eventId, Collection<RegistrationStatus> statuses);

    /** Waitlisted registrations for an event, oldest first — the promotion order (first in, first off). */
    List<Registration> findByEventIdAndStatusOrderByCreatedAtAsc(Long eventId, RegistrationStatus status);
}
