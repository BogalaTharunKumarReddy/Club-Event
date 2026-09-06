package com.campusconnect.entity;

import com.campusconnect.entity.enums.RegistrationStatus;
import com.campusconnect.entity.enums.RegistrationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "registrations",
        indexes = {
                @Index(name = "idx_reg_event", columnList = "event_id"),
                @Index(name = "idx_reg_user", columnList = "user_id"),
                @Index(name = "idx_reg_status", columnList = "status"),
                @Index(name = "idx_reg_ticket", columnList = "ticket_code")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_reg_event_user", columnNames = {"event_id", "user_id"}),
                @UniqueConstraint(name = "uk_reg_ticket", columnNames = "ticket_code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private RegistrationType type = RegistrationType.INDIVIDUAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.REGISTERED;

    /** Opaque unique code embedded in the QR ticket. Never contains personal data. */
    @Column(name = "ticket_code", nullable = false, length = 64)
    private String ticketCode;
}
