package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Post a comment or question on an event. Supply {@code parentId} to reply to an
 * existing comment; omit it for a new top-level comment/question.
 */
public record CommentRequest(
        @NotBlank(message = "Comment cannot be empty")
        @Size(max = 4000, message = "Comment must be 4000 characters or fewer")
        String content,
        Long parentId
) {
}
