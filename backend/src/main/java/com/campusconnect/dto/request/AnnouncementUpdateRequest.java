package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Edit an existing announcement. Scope and the club/event it belongs to are
 * immutable once posted — only the title, body and pinned flag can change.
 */
public record AnnouncementUpdateRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 10000) String content,
        boolean pinned
) {
}
