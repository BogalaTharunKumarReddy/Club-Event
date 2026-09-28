package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.AnnouncementScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Create an announcement. Provide {@code clubId} for CLUB scope and {@code eventId} for EVENT scope;
 * both may be omitted for a GENERAL (campus-wide) announcement.
 */
public record AnnouncementRequest(
        @NotNull AnnouncementScope scope,
        Long clubId,
        Long eventId,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 10000) String content,
        boolean pinned
) {
}
