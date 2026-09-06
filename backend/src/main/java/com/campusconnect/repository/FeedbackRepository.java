package com.campusconnect.repository;

import com.campusconnect.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByEventId(Long eventId);

    Optional<Feedback> findByEventIdAndUserId(Long eventId, Long userId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    @Query("select coalesce(avg(f.rating), 0) from Feedback f where f.event.id = :eventId")
    Double averageRatingForEvent(@Param("eventId") Long eventId);

    long countByEventId(Long eventId);
}
