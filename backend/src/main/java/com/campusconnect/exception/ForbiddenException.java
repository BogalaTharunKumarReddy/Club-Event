package com.campusconnect.exception;

/** Thrown when the authenticated user lacks permission for an action. Mapped to HTTP 403. */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
