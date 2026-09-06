package com.campusconnect.service.impl;

import com.campusconnect.dto.request.PaymentInitiateRequest;
import com.campusconnect.dto.response.PaymentResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Payment;
import com.campusconnect.entity.Registration;
import com.campusconnect.entity.User;
import com.campusconnect.entity.enums.NotificationType;
import com.campusconnect.entity.enums.PaymentStatus;
import com.campusconnect.entity.enums.RegistrationStatus;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.ForbiddenException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.mapper.PaymentMapper;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.PaymentRepository;
import com.campusconnect.repository.RegistrationRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.ClubAccess;
import com.campusconnect.service.NotificationService;
import com.campusconnect.service.PaymentService;
import com.campusconnect.service.payment.GatewayChargeRequest;
import com.campusconnect.service.payment.GatewayChargeResult;
import com.campusconnect.service.payment.PaymentGateway;
import com.campusconnect.service.payment.PaymentGatewayResolver;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final DateTimeFormatter RECEIPT_DATE_FMT =
            DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a", Locale.ENGLISH).withZone(ZoneId.of("UTC"));

    private final PaymentRepository paymentRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final ClubAccess clubAccess;
    private final PaymentGatewayResolver gatewayResolver;
    private final NotificationService notificationService;

    @Value("${app.payment.currency:INR}")
    private String currency;

    @Override
    @Transactional
    public PaymentResponse initiate(Long userId, PaymentInitiateRequest request) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.eventId()));

        if (!event.isPaidEvent() || event.getFee() == null || event.getFee().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This event does not require payment.");
        }

        Registration registration = registrationRepository.findByEventIdAndUserId(event.getId(), userId)
                .orElseThrow(() -> new BadRequestException("Register for the event before paying."));
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new BadRequestException("Your registration for this event has been cancelled.");
        }
        if (registration.getStatus() == RegistrationStatus.WAITLISTED) {
            throw new BadRequestException(
                    "You're on the waitlist for this event. You can pay once a seat opens up for you.");
        }

        boolean alreadyPaid = paymentRepository.findByUserIdAndEventId(userId, event.getId()).stream()
                .anyMatch(p -> p.getStatus() == PaymentStatus.SUCCESS);
        if (alreadyPaid) {
            throw new ConflictException("You have already paid for this event.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        PaymentGateway gateway = gatewayResolver.resolve();
        String receiptNumber = generateReceiptNumber();

        Payment payment = Payment.builder()
                .user(user)
                .event(event)
                .registration(registration)
                .amount(event.getFee())
                .status(PaymentStatus.PENDING)
                .provider(gateway.provider())
                .receiptNumber(receiptNumber)
                .build();
        payment = paymentRepository.save(payment);

        GatewayChargeResult result = gateway.charge(new GatewayChargeRequest(
                receiptNumber, event.getFee(), currency,
                "Registration fee for " + event.getTitle(), user.getEmail()));

        payment.setProviderReference(result.providerReference());
        payment.setStatus(result.status());

        if (result.status() == PaymentStatus.SUCCESS) {
            payment.setPaidAt(Instant.now());
            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                registration.setStatus(RegistrationStatus.CONFIRMED);
                registrationRepository.save(registration);
            }
            notificationService.notifyUser(userId, NotificationType.PAYMENT_UPDATE,
                    "Payment successful",
                    "Your payment of " + currency + " " + event.getFee() + " for " + event.getTitle()
                            + " was successful. Receipt: " + receiptNumber,
                    "/events/" + event.getId());
        } else {
            notificationService.notifyUser(userId, NotificationType.PAYMENT_UPDATE,
                    "Payment failed",
                    "Your payment for " + event.getTitle() + " could not be processed. Please try again.",
                    "/events/" + event.getId());
        }

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getMyPayment(Long userId, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));
        if (payment.getUser() == null || !payment.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only view your own payments.");
        }
        return PaymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> myPayments(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Payment::getCreatedAt).reversed())
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> eventPayments(Long actingUserId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        clubAccess.requireAdminOrCoordinator(event.getClub().getId(), actingUserId);
        return paymentRepository.findByEventId(eventId).stream()
                .sorted(Comparator.comparing(Payment::getCreatedAt).reversed())
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PaymentResponse refund(Long actingUserId, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        Event event = payment.getEvent();
        if (event == null || event.getClub() == null) {
            throw new BadRequestException("This payment is not associated with a club event.");
        }
        clubAccess.requireAdminOrCoordinator(event.getClub().getId(), actingUserId);

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Only a successful payment can be refunded.");
        }

        PaymentGateway gateway = gatewayResolver.resolve(payment.getProvider());
        GatewayChargeResult result = gateway.refund(payment.getProviderReference(), payment.getAmount());
        if (result.status() != PaymentStatus.REFUNDED) {
            throw new BadRequestException("The payment provider could not process this refund. Please try again.");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundedAt(Instant.now());
        payment.setProviderReference(result.providerReference());

        // Free the seat: a confirmed registration reverts to REGISTERED so it can be
        // re-confirmed if the attendee pays again. Cancellation stays a separate action.
        Registration registration = payment.getRegistration();
        if (registration != null && registration.getStatus() == RegistrationStatus.CONFIRMED) {
            registration.setStatus(RegistrationStatus.REGISTERED);
            registrationRepository.save(registration);
        }

        Payment saved = paymentRepository.save(payment);

        if (payment.getUser() != null) {
            notificationService.notifyUser(payment.getUser().getId(), NotificationType.PAYMENT_UPDATE,
                    "Payment refunded",
                    "Your payment of " + currency + " " + payment.getAmount() + " for " + event.getTitle()
                            + " has been refunded.",
                    "/events/" + event.getId());
        }

        return PaymentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] renderReceipt(Long actingUserId, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        boolean owner = payment.getUser() != null && payment.getUser().getId().equals(actingUserId);
        boolean privileged = payment.getEvent() != null && payment.getEvent().getClub() != null
                && clubAccess.isAdminOrCoordinator(payment.getEvent().getClub().getId(), actingUserId);
        if (!owner && !privileged) {
            throw new ForbiddenException("You are not allowed to view this receipt.");
        }

        if (payment.getStatus() != PaymentStatus.SUCCESS && payment.getStatus() != PaymentStatus.REFUNDED) {
            throw new BadRequestException("A receipt is only available for a completed payment.");
        }
        return buildReceiptPdf(payment);
    }

    private byte[] buildReceiptPdf(Payment payment) {
        Document document = new Document(PageSize.A4, 56, 56, 64, 56);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font brandFont = new Font(Font.HELVETICA, 22, Font.BOLD, new Color(37, 99, 235));
            Font subtitleFont = new Font(Font.HELVETICA, 12, Font.NORMAL, new Color(100, 116, 139));
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(71, 85, 105));
            Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(15, 23, 42));
            Font footerFont = new Font(Font.HELVETICA, 9, Font.ITALIC, new Color(148, 163, 184));

            document.add(new Paragraph("CampusConnect", brandFont));
            Paragraph subtitle = new Paragraph("Payment Receipt", subtitleFont);
            subtitle.setSpacingAfter(18);
            document.add(subtitle);

            boolean refunded = payment.getStatus() == PaymentStatus.REFUNDED;
            Event event = payment.getEvent();
            User payer = payment.getUser();

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            try {
                table.setWidths(new float[]{1.1f, 2.4f});
            } catch (Exception ignored) {
                // default widths are acceptable if this ever fails
            }
            table.setSpacingBefore(6);

            addRow(table, "Receipt No.", payment.getReceiptNumber(), labelFont, valueFont);
            addRow(table, "Status", refunded ? "Refunded" : "Paid", labelFont, valueFont);
            Instant when = refunded && payment.getRefundedAt() != null ? payment.getRefundedAt() : payment.getPaidAt();
            addRow(table, refunded ? "Refunded on" : "Paid on",
                    when != null ? RECEIPT_DATE_FMT.format(when) + " UTC" : "-", labelFont, valueFont);
            addRow(table, "Billed to", payer != null ? payer.getFullName() : "-", labelFont, valueFont);
            addRow(table, "Email", payer != null ? payer.getEmail() : "-", labelFont, valueFont);
            addRow(table, "Event", event != null ? event.getTitle() : "-", labelFont, valueFont);
            addRow(table, "Amount", formatAmount(payment.getAmount()), labelFont, valueFont);
            addRow(table, "Payment method",
                    payment.getProvider() != null ? payment.getProvider() : "-", labelFont, valueFont);
            addRow(table, "Reference",
                    payment.getProviderReference() != null ? payment.getProviderReference() : "-", labelFont, valueFont);
            document.add(table);

            Paragraph footer = new Paragraph(
                    "This is a system-generated receipt and does not require a signature.", footerFont);
            footer.setSpacingBefore(24);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to render payment receipt", ex);
        }
    }

    private static void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(0);
        labelCell.setPadding(6f);
        labelCell.setBackgroundColor(new Color(248, 250, 252));
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "-", valueFont));
        valueCell.setBorder(0);
        valueCell.setPadding(6f);
        valueCell.setHorizontalAlignment(Element.ALIGN_LEFT);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private String formatAmount(BigDecimal amount) {
        BigDecimal value = amount != null ? amount : BigDecimal.ZERO;
        return String.format(Locale.US, "%s %,.2f", currency, value);
    }

    private String generateReceiptNumber() {
        return "RCPT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }
}
