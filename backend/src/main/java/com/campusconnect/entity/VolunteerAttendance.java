package com.campusconnect.entity;

import com.campusconnect.entity.enums.VolunteerAttendanceStatus;
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
 * A volunteer's own shift attendance for an event. One row per (volunteer,
 * event) so a volunteer cannot double check-in; hours_worked is computed on
 * check-out and rolled into {@link Volunteer#getTotalHours()}.
 */
@Entity
@Table(
        name = "volunteer_attendance",
        indexes = {
                @Index(name = "idx_vatt_volunteer", columnList = "volunteer_id"),
                @Index(name = "idx_vatt_event", columnList = "event_id"),
                @Index(name = "idx_vatt_status", columnList = "status")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uk_vatt_volunteer_event", columnNames = {"volunteer_id", "event_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerAttendance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private Volunteer volunteer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "check_in_time")
    private Instant checkInTime;

    @Column(name = "check_out_time")
    private Instant checkOutTime;

    /** Hours between check-in and check-out, set on check-out. */
    @Column(name = "hours_worked", nullable = false)
    @Builder.Default
    private double hoursWorked = 0d;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private VolunteerAttendanceStatus status = VolunteerAttendanceStatus.PRESENT;
}
