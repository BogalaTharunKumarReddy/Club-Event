package com.campusconnect.service.payment;

/**
 * Raised when a payment provider cannot be reached or rejects a request for infrastructural reasons
 * (bad/missing credentials, network failure, non-2xx response). Distinct from a business rejection
 * such as a failed signature check, which is surfaced as a normal validation error. Mapped to
 * HTTP 502 by the global handler so the client can tell "provider problem" from "your request was
 * invalid".
 */
public class PaymentGatewayException extends RuntimeException {

    public PaymentGatewayException(String message) {
        super(message);
    }

    public PaymentGatewayException(String message, Throwable cause) {
        super(message, cause);
    }
}
