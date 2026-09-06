package com.campusconnect.repository;

import com.campusconnect.entity.Event;
import com.campusconnect.entity.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    List<Event> findByClubId(Long clubId);

    List<Event> findByStatus(EventStatus status);

    List<Event> findByFeaturedTrueAndStatus(EventStatus status);

    List<Event> findByStatusAndStartDateTimeBetween(EventStatus status, LocalDateTime from, LocalDateTime to);

    long countByClubId(Long clubId);

    long countByStatus(EventStatus status);
}
