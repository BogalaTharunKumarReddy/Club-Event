package com.campusconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/**
 * A comment or question on an event's discussion thread.
 *
 * <p>Threading is intentionally a single level: a top-level comment has
 * {@code parent == null}; a reply points at its top-level parent. {@code pinned}
 * and {@code resolved} are only meaningful on top-level comments — a coordinator
 * pins highlights and marks a question answered.
 *
 * <p>{@code fromOrganizer} is a snapshot taken at post time of whether the author
 * was an admin/coordinator of the owning club, so the UI can badge official replies
 * without a per-render authorization lookup.
 */
@Entity
@Table(
        name = "event_comments",
        indexes = {
                @Index(name = "idx_comment_event", columnList = "event_id"),
                @Index(name = "idx_comment_parent", columnList = "parent_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /** Null for a top-level comment; the top-level comment for a reply. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder.Default
    @Column(nullable = false)
    private boolean pinned = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean resolved = false;

    @Builder.Default
    @Column(name = "from_organizer", nullable = false)
    private boolean fromOrganizer = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean edited = false;
}
