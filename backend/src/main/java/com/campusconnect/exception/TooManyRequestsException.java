package com.campusconnect.exception;

/**
 * Thrown when a client exceeds an allowed request rate (e.g. too many failed
 * login attempts). Mapped to HTTP 429 by {@link GlobalExceptionHandler}.
 */
public class TooManyRequestsException extends RuntimeException {

    public TooManyRequestsException(String message) {
        super(message);
    }
}
