package com.campusconnect.repository;

import com.campusconnect.entity.Payment;
import com.campusconnect.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserId(Long userId);

    List<Payment> findByEventId(Long eventId);

    List<Payment> findByUserIdAndEventId(Long userId, Long eventId);

    /** All payments for an event in a given status — used to resolve the certificate payment gate in bulk. */
    List<Payment> findByEventIdAndStatus(Long eventId, PaymentStatus status);

    boolean existsByUserIdAndEventIdAndStatus(Long userId, Long eventId, PaymentStatus status);

    long countByStatus(PaymentStatus status);

    /** Paged payments in a given status — used by the platform-wide admin payments view. */
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    /** Sum of payment amounts in a given status (0 when there are none). */
    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);
}
