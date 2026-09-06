package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;

/** QR-based check-in. The ticket code is the opaque value encoded in the participant's QR image. */
public record CheckInRequest(
        @NotBlank(message = "Ticket code is required")
        String ticketCode
) {
}
