package com.campusconnect.repository;

import com.campusconnect.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    /** Top-level comments for an event, pinned first then newest first. */
    List<Comment> findByEventIdAndParentIsNullOrderByPinnedDescCreatedAtDesc(Long eventId);

    /** Every reply for an event (across all threads), oldest first for chronological display. */
    List<Comment> findByEventIdAndParentIsNotNullOrderByCreatedAtAsc(Long eventId);

    /** Replies to a single top-level comment, oldest first. */
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);

    /** Remove every reply under a top-level comment (used when deleting the parent). */
    void deleteByParentId(Long parentId);
}
