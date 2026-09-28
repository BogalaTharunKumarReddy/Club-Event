package com.campusconnect.service.storage;

/**
 * Result of a successful {@link StorageService#store} call.
 *
 * @param key         opaque storage key used to later fetch or delete the object
 * @param url         resolvable URL — a relative API path for local storage, an absolute
 *                    object-store URL for S3; safe to persist on entities and hand to the client
 * @param contentType stored MIME type
 * @param size        size in bytes
 */
public record StoredFile(String key, String url, String contentType, long size) {
}
