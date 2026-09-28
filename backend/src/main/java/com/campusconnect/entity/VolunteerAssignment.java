package com.campusconnect.entity;

import com.campusconnect.entity.enums.VolunteerAssignmentStatus;
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

import java.time.Instant;

/**
 * Links a volunteer to a specific event with a role and shift window. A
 * volunteer can only be assigned to a given event once (unique constraint),
 * and check-in / QR-scan duty is gated on an ACCEPTED/IN_PROGRESS assignment.
 */
@Entity
@Table(
        name = "volunteer_assignments",
        indexes = {
                @Index(name = "idx_vasgn_volunteer", columnList = "volunteer_id"),
                @Index(name = "idx_vasgn_event", columnList = "event_id"),
                @Index(name = "idx_vasgn_status", columnList = "status")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uk_vasgn_volunteer_event", columnNames = {"volunteer_id", "event_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private Volunteer volunteer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    /** The coordinator/member who created the assignment. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    /** Volunteer role for this event, e.g. "Registration Desk", "Stage Crew". */
    @Column(nullable = false, length = 120)
    private String role;

    private Instant shiftStart;

    private Instant shiftEnd;

    /** Reporting location / venue note for the shift. */
    @Column(length = 200)
    private String location;

    /** Grants this volunteer QR/check-in duty for the event when true. */
    @Column(name = "checkin_duty", nullable = false)
    @Builder.Default
    private boolean checkInDuty = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private VolunteerAssignmentStatus status = VolunteerAssignmentStatus.ASSIGNED;
}
