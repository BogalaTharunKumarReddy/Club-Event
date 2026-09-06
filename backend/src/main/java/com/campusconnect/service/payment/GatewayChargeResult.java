package com.campusconnect.service.payment;

import com.campusconnect.entity.enums.PaymentStatus;

/** Provider-agnostic result of a charge or verification. */
public record GatewayChargeResult(
        String providerReference,
        PaymentStatus status,
        String message
) {
}
