package com.campusconnect.service.storage;

/**
 * Provider-agnostic file storage. Implementations persist binary content somewhere durable
 * (local disk, S3-compatible object store, …) and hand back a {@link StoredFile} whose {@code url}
 * the rest of the app treats as opaque — it may be a relative API path (local) or an absolute
 * object-store URL (S3). Credentials live inside each implementation, injected from the
 * environment, and never leak into the domain layer or the client.
 *
 * <p>Adding a new backend is a matter of dropping in another {@code @Component} that implements
 * this interface and returns a distinct {@link #provider()} key; {@link StorageResolver} discovers
 * it automatically and {@code app.storage.provider} selects which one is active.
 */
public interface StorageService {

    /** Stable lower-case identifier for this backend (e.g. {@code "local"}, {@code "s3"}). */
    String provider();

    /**
     * Persist the given bytes and return a handle including a resolvable URL.
     *
     * @param folder        logical prefix / sub-directory (e.g. {@code "banners"}, {@code "avatars"});
     *                      blank is treated as the root
     * @param originalName  the client-supplied filename, used only to derive a safe extension
     * @param contentType   MIME type to store and later serve the object as
     * @param content       the file bytes (never null)
     */
    StoredFile store(String folder, String originalName, String contentType, byte[] content);

    /**
     * Delete a previously stored object by its storage key (the {@link StoredFile#key()}).
     * Best-effort: a missing object is not an error. Never throws to callers.
     */
    void delete(String key);
}
