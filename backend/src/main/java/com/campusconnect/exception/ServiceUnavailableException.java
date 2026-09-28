package com.campusconnect.exception;

/**
 * Thrown when an optional downstream capability is not configured or is
 * temporarily unreachable (e.g. the AI assistant when no API key is set, or the
 * upstream model provider is failing). Mapped to HTTP 503 by
 * {@link GlobalExceptionHandler} so the client can degrade gracefully rather
 * than surfacing a generic 500.
 */
public class ServiceUnavailableException extends RuntimeException {

    public ServiceUnavailableException(String message) {
        super(message);
    }
}
