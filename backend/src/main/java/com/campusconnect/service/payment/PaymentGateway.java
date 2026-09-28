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

<<<<<<< HEAD
    /**
     * Attempt to charge the customer. Synchronous gateways (e.g. the mock) return a terminal
     * {@code SUCCESS}/{@code FAILED} result immediately; gateways with a hosted browser checkout
     * return {@code PENDING} together with the reference the client needs (e.g. a Razorpay order id).
     */
    GatewayChargeResult charge(GatewayChargeRequest request);

    /**
     * Confirm a charge after a client-side checkout hands control back (e.g. verifying the
     * signature Razorpay returns to the browser). Implementations must not trust the client blindly
     * — they validate the supplied parameters against the provider before returning {@code SUCCESS}.
     */
    GatewayChargeResult verify(GatewayVerifyRequest request);
=======
    /** Attempt to charge the customer. */
    GatewayChargeResult charge(GatewayChargeRequest request);

    /** Re-check the status of a previously created charge (e.g. after a webhook or redirect). */
    GatewayChargeResult verify(String providerReference);
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6

    /**
     * Refund a previously successful charge. Implementations should be idempotent where the
     * provider allows it. The returned result carries the (possibly new) provider reference and a
     * {@code REFUNDED} status on success.
     */
    GatewayChargeResult refund(String providerReference, BigDecimal amount);
}
