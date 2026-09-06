package com.campusconnect.entity;

import jakarta.persistence.Entity;
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

/**
 * A user's bookmark of an event ("save for later"). Purely personal — it grants
 * no registration or attendance. {@code createdAt} (from {@link BaseEntity})
 * records when the event was saved, so the saved list can be shown newest-first.
 */
@Entity
@Table(
        name = "saved_events",
        indexes = {
                @Index(name = "idx_savedevent_event", columnList = "event_id"),
                @Index(name = "idx_savedevent_user", columnList = "user_id")
        },
        uniqueConstraints = @UniqueConstraint(name = "uk_saved_event", columnNames = {"event_id", "user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
