package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Second step of a two-factor login: the opaque challenge handle returned by
 * {@code /auth/login} plus the numeric OTP the user received by email.
 */
public record VerifyOtpRequest(
        @NotBlank(message = "Challenge token is required")
        String challengeToken,

        @NotBlank(message = "The verification code is required")
        @Pattern(regexp = "\\d{6}", message = "The verification code must be 6 digits")
        String code
) {
}
