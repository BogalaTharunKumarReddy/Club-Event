package com.campusconnect.dto.response;

import java.time.Instant;
import java.util.List;

/**
 * A discussion comment. Top-level comments carry their {@code replies} inline
 * (oldest first); reply objects have an empty {@code replies} list and a non-null
 * {@code parentId}.
 */
public record CommentResponse(
        Long id,
        Long eventId,
        Long authorId,
        String authorName,
        String authorPhotoUrl,
        String content,
        boolean pinned,
        boolean resolved,
        boolean fromOrganizer,
        boolean edited,
        Long parentId,
        Instant createdAt,
        Instant updatedAt,
        int replyCount,
        List<CommentResponse> replies
) {
}
