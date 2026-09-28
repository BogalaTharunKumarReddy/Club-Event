package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Confirms a ticket-verification challenge with the 6-digit code sent to the attendee. */
public record VerifyTicketRequest(
        @NotBlank(message = "Verification code is required")
        @Pattern(regexp = "\\d{6}", message = "Enter the 6-digit code")
        String code
) {
}
