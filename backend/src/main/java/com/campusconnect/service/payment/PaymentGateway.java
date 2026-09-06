package com.campusconnect.service.payment;

import java.math.BigDecimal;

/**
 * Abstraction over payment providers so new gateways (Stripe, Razorpay, PayU, …) can be added
 * without touching business logic. To add a provider, implement this interface as a Spring bean
 * and set {@code app.payment.provider} to its {@link #provider()} name. Provider API keys must be
 * read from environment variables inside the implementation — never hardcoded or exposed to clients.
 */
public interface PaymentGateway {

    /** Unique provider key, e.g. {@code "mock"}, {@code "stripe"}, {@code "razorpay"}. */
    String provider();

    /** Attempt to charge the customer. */
    GatewayChargeResult charge(GatewayChargeRequest request);

    /** Re-check the status of a previously created charge (e.g. after a webhook or redirect). */
    GatewayChargeResult verify(String providerReference);

    /**
     * Refund a previously successful charge. Implementations should be idempotent where the
     * provider allows it. The returned result carries the (possibly new) provider reference and a
     * {@code REFUNDED} status on success.
     */
    GatewayChargeResult refund(String providerReference, BigDecimal amount);
}
