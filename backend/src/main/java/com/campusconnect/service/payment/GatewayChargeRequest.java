package com.campusconnect.service.payment;

import java.math.BigDecimal;

/**
 * Provider-agnostic charge request. Contains only the data any gateway would need — never
 * any provider credentials (those are injected into each {@link PaymentGateway} from the
 * environment, never passed through the domain layer).
 */
public record GatewayChargeRequest(
        String reference,
        BigDecimal amount,
        String currency,
        String description,
        String customerEmail
) {
}
