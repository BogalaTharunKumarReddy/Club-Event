package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Confirms a payment after a client-side checkout (e.g. Razorpay) returns to the app. The order
 * reference is looked up from the stored payment, so the client only sends the provider payment id
 * and the signature to be validated server-side.
 */
public record PaymentVerifyRequest(
        @NotNull(message = "Payment id is required")
        Long paymentId,

        @NotBlank(message = "Provider payment id is required")
        @Size(max = 120)
        String providerPaymentId,

        @NotBlank(message = "Signature is required")
        @Size(max = 256)
        String signature
) {
}
