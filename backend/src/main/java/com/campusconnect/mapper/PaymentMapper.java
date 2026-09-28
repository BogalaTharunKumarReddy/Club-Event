package com.campusconnect.mapper;

import com.campusconnect.dto.response.PaymentResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Payment;
import com.campusconnect.entity.User;

public final class PaymentMapper {

    private PaymentMapper() {
    }

    public static PaymentResponse toResponse(Payment payment) {
        if (payment == null) {
            return null;
        }
        Event event = payment.getEvent();
        User user = payment.getUser();
        return new PaymentResponse(
                payment.getId(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                payment.getAmount(),
                payment.getStatus(),
                payment.getProvider(),
                payment.getProviderReference(),
                payment.getReceiptNumber(),
                payment.getPaidAt(),
                payment.getRefundedAt(),
                payment.getCreatedAt()
        );
    }
}
