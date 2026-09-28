package com.campusconnect.entity;

import com.campusconnect.entity.enums.EventMode;
import com.campusconnect.entity.enums.EventStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "events",
        indexes = {
                @Index(name = "idx_event_status", columnList = "status"),
                @Index(name = "idx_event_club", columnList = "club_id"),
                @Index(name = "idx_event_category", columnList = "category"),
                @Index(name = "idx_event_start", columnList = "start_date_time")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event extends BaseEntity {

    @Column(nullable = false, length = 180)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 80)
    private String category;

    private String bannerUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private EventMode mode = EventMode.OFFLINE;

    @Column(length = 200)
    private String venue;

    private String onlineUrl;

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;

    private LocalDateTime registrationDeadline;

    /** Maximum confirmed participants. Null or 0 means unlimited. */
    private Integer capacity;

    @Column(columnDefinition = "TEXT")
    private String rules;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    @Builder.Default
    @Column(nullable = false)
    private boolean paidEvent = false;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private boolean teamEvent = false;

    private Integer minTeamSize;

    private Integer maxTeamSize;

    @Builder.Default
    @Column(nullable = false)
    private boolean featured = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
