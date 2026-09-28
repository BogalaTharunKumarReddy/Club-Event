package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Edit the text of an existing comment (author only). */
public record CommentUpdateRequest(
        @NotBlank(message = "Comment cannot be empty")
        @Size(max = 4000, message = "Comment must be 4000 characters or fewer")
        String content
) {
}
