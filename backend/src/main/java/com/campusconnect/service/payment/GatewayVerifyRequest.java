package com.campusconnect.service.payment;

import java.util.Map;

/**
 * Provider-agnostic verification request used after a client-side checkout returns control to the
 * app (e.g. a Razorpay redirect/handler). {@code providerReference} is whatever the gateway handed
 * back at {@link PaymentGateway#charge} time (for Razorpay, the order id); {@code params} carries the
 * provider-specific fields the browser returned (e.g. {@code payment_id}, {@code signature}). No
 * provider credentials ever travel through this object — those live only inside the gateway bean.
 */
public record GatewayVerifyRequest(
        String providerReference,
        Map<String, String> params
) {
    public GatewayVerifyRequest {
        params = params == null ? Map.of() : Map.copyOf(params);
    }

    public String param(String key) {
        return params.get(key);
    }
}
