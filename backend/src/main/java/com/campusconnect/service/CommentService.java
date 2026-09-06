package com.campusconnect.service;

import com.campusconnect.dto.request.CommentRequest;
import com.campusconnect.dto.request.CommentUpdateRequest;
import com.campusconnect.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {

    /** Post a comment or question on an event (reply when {@code request.parentId()} is set). */
    CommentResponse create(Long actingUserId, Long eventId, CommentRequest request);

    /** Edit the text of your own comment. */
    CommentResponse update(Long actingUserId, Long commentId, CommentUpdateRequest request);

    /** Delete a comment (author, or an admin/coordinator of the owning club). */
    void delete(Long actingUserId, Long commentId);

    /** Pin or unpin a top-level comment (admin/coordinator of the owning club). */
    CommentResponse setPinned(Long actingUserId, Long commentId, boolean pinned);

    /**
     * Mark a top-level comment/question resolved or reopen it
     * (admin/coordinator of the owning club, or the original author).
     */
    CommentResponse setResolved(Long actingUserId, Long commentId, boolean resolved);

    /** Public discussion for an event: top-level comments with their replies nested. */
    List<CommentResponse> listByEvent(Long eventId);
}
