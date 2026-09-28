package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Passwordless ("WhatsApp / email") login: request a one-time code for an account.
 * The {@code identifier} may be the account email or the registered phone number.
 * The response is deliberately non-enumerating — it always returns a challenge token,
 * whether or not an account matched, so callers cannot probe which accounts exist.
 */
public record LoginOtpRequest(
        @NotBlank(message = "Enter your email or phone number")
        String identifier
) {
}
