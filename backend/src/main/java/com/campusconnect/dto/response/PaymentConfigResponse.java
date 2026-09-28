package com.campusconnect.dto.response;

/**
 * Public payment configuration the browser needs to start a checkout. Contains only non-secret
 * values — for a hosted-checkout provider this is the publishable key. The secret key never leaves
 * the server.
 */
public record PaymentConfigResponse(
        String provider,
        boolean clientCheckout,
        String razorpayKeyId,
        String currency
) {
}
