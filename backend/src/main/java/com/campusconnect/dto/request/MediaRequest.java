package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Add a media item (image or video) to a gallery. Provide exactly one of
 * {@code eventId} or {@code clubId} to say which gallery it belongs to. The
 * {@code url} is produced by first uploading the file via {@code POST /api/files}
 * (for images) or is an external link (for videos, e.g. YouTube).
 */
public record MediaRequest(
        Long eventId,
        Long clubId,
        @NotBlank @Size(max = 1000) String url,
        @Pattern(regexp = "IMAGE|VIDEO", message = "mediaType must be IMAGE or VIDEO") String mediaType,
        @Size(max = 200) String caption
) {
}
