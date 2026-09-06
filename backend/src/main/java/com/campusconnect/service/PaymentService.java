package com.campusconnect.service;

import com.campusconnect.dto.request.PaymentInitiateRequest;
import com.campusconnect.dto.response.PaymentResponse;

import java.util.List;

public interface PaymentService {

    /** Initiate (and, for synchronous providers like the mock, complete) payment for a registration. */
    PaymentResponse initiate(Long userId, PaymentInitiateRequest request);

    PaymentResponse getMyPayment(Long userId, Long paymentId);

    List<PaymentResponse> myPayments(Long userId);

    /** Payments for an event — visible to a coordinator of the owning club. */
    List<PaymentResponse> eventPayments(Long actingUserId, Long eventId);

    /**
     * Refund a successful payment. Allowed for a platform admin or a coordinator of the
     * owning club. Reverses the gateway charge, marks the payment REFUNDED and reverts a
     * confirmed registration back to REGISTERED so the seat can be re-confirmed on re-payment.
     */
    PaymentResponse refund(Long actingUserId, Long paymentId);

    /**
     * Render a PDF receipt for a completed (successful or refunded) payment. Accessible to the
     * paying user, or to a platform admin / coordinator of the event's owning club.
     */
    byte[] renderReceipt(Long actingUserId, Long paymentId);
}
