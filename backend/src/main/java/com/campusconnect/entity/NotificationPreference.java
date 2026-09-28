package com.campusconnect.entity;

import com.campusconnect.entity.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Per-user email notification preferences (1:1 with {@link User}).
 *
 * <p>In-app notifications are always delivered — they are the user's activity feed.
 * These preferences gate only <em>email</em> delivery. A master {@code emailEnabled}
 * switch turns off all email; the per-category flags let a user keep, say, payment
 * receipts while muting announcements. The opaque {@code unsubscribeToken} backs a
 * one-click unsubscribe link embedded in every outbound email.
 */
@Entity
@Table(
        name = "notification_preferences",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_notif_pref_user", columnNames = "user_id"),
                @UniqueConstraint(name = "uk_notif_pref_token", columnNames = "unsubscribe_token")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    /** Master switch — when false, no email is ever sent regardless of the category flags. */
    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;

    /** Registrations, reminders, schedule changes and cancellations. */
    @Column(name = "email_on_events", nullable = false)
    @Builder.Default
    private boolean emailOnEvents = true;

    /** Club and event announcements. */
    @Column(name = "email_on_announcements", nullable = false)
    @Builder.Default
    private boolean emailOnAnnouncements = true;

    /** Certificate issued / available to download. */
    @Column(name = "email_on_certificates", nullable = false)
    @Builder.Default
    private boolean emailOnCertificates = true;

    /** Payment confirmations, refunds and receipts. */
    @Column(name = "email_on_payments", nullable = false)
    @Builder.Default
    private boolean emailOnPayments = true;

    /** General / system messages that do not fall into another category. */
    @Column(name = "email_on_general", nullable = false)
    @Builder.Default
    private boolean emailOnGeneral = true;

    /** Opaque token backing the one-click unsubscribe link; never guessable, never reused. */
    @Column(name = "unsubscribe_token", nullable = false, length = 64)
    @Builder.Default
    private String unsubscribeToken = UUID.randomUUID().toString();

    /** Builds a fresh set of default (all-on) preferences for a user, with a new unsubscribe token. */
    public static NotificationPreference defaultsFor(User user) {
        return NotificationPreference.builder()
                .user(user)
                .build();
    }

    /**
     * Whether an email should be sent for a notification of the given type, honouring
     * both the master switch and the per-category flag.
     */
    public boolean allowsEmail(NotificationType type) {
        if (!emailEnabled || type == null) {
            return false;
        }
        return switch (type) {
            case REGISTRATION_CONFIRMATION, EVENT_REMINDER, SCHEDULE_UPDATE, EVENT_CANCELLED -> emailOnEvents;
            case ANNOUNCEMENT -> emailOnAnnouncements;
            case CERTIFICATE_ISSUED -> emailOnCertificates;
            case PAYMENT_UPDATE -> emailOnPayments;
            case GENERAL -> emailOnGeneral;
        };
    }
}
