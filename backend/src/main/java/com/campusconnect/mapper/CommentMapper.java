package com.campusconnect.mapper;

import com.campusconnect.dto.response.CommentResponse;
import com.campusconnect.entity.Comment;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;

import java.util.List;

public final class CommentMapper {

    private CommentMapper() {
    }

    /** Map a single comment with no nested replies (used for reply objects). */
    public static CommentResponse toResponse(Comment comment) {
        return build(comment, List.of());
    }

    /** Map a top-level comment together with its replies (nested oldest-first). */
    public static CommentResponse toThread(Comment parent, List<Comment> replies) {
        List<CommentResponse> mapped = replies.stream()
                .map(CommentMapper::toResponse)
                .toList();
        return build(parent, mapped);
    }

    private static CommentResponse build(Comment comment, List<CommentResponse> replies) {
        if (comment == null) {
            return null;
        }
        Event event = comment.getEvent();
        User author = comment.getAuthor();
        Comment parent = comment.getParent();
        return new CommentResponse(
                comment.getId(),
                event != null ? event.getId() : null,
                author != null ? author.getId() : null,
                author != null ? author.getFullName() : null,
                author != null ? author.getProfilePhotoUrl() : null,
                comment.getContent(),
                comment.isPinned(),
                comment.isResolved(),
                comment.isFromOrganizer(),
                comment.isEdited(),
                parent != null ? parent.getId() : null,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies.size(),
                replies
        );
    }
}
