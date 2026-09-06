package com.campusconnect.repository;

import com.campusconnect.entity.SavedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface SavedEventRepository extends JpaRepository<SavedEvent, Long> {

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    Optional<SavedEvent> findByEventIdAndUserId(Long eventId, Long userId);

    long countByEventId(Long eventId);

    /** A user's bookmarks, newest first — backs the "saved events" list. */
    List<SavedEvent> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** The set of event ids a user has saved, for batch-flagging event listings without N+1 lookups. */
    @Query("select se.event.id from SavedEvent se where se.user.id = :userId")
    Set<Long> findEventIdsByUserId(@Param("userId") Long userId);
}
