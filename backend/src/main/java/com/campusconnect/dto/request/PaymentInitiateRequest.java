package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotNull;

/** Initiates payment for the current user's registration to a paid event. */
public record PaymentInitiateRequest(
        @NotNull(message = "Event id is required")
        Long eventId
) {
}
