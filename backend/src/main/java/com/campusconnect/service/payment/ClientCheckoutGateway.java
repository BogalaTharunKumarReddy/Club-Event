package com.campusconnect.service.payment;

/**
 * Optional capability implemented by gateways whose payment is completed in the browser (a hosted
 * checkout widget) rather than synchronously on the server. Such gateways return a {@code PENDING}
 * charge that must later be confirmed via {@link PaymentGateway#verify}. The only thing the browser
 * needs is the <em>publishable</em> key — never the secret, which stays inside the gateway bean.
 */
public interface ClientCheckoutGateway {

    /**
     * The public/publishable key the browser SDK needs to open the checkout, or {@code null} when
     * the gateway is not configured. Never returns the secret key.
     */
    String publicKey();
}
