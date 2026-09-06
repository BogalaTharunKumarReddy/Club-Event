package com.campusconnect.exception;

/** Thrown when an action conflicts with current state (e.g. duplicate). Mapped to HTTP 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
