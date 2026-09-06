package com.campusconnect.dto.response;

/**
 * Returned after a successful file upload. {@code url} is what the client stores on an entity
 * (event banner, avatar, media item …); {@code key} lets the owner request deletion later.
 */
public record UploadResponse(
        String key,
        String url,
        String contentType,
        long size,
        String originalFilename
) {
}
