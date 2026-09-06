package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long userId,
        String userName,
        BigDecimal amount,
        PaymentStatus status,
        String provider,
        String providerReference,
        String receiptNumber,
        Instant paidAt,
        Instant refundedAt,
        Instant createdAt
) {
}
