package com.campusconnect.entity;

import com.campusconnect.entity.enums.AuditAction;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * An immutable record of an administrative action. Actor and target details are
 * denormalized (stored as snapshot columns rather than foreign keys) on purpose:
 * an audit entry must survive the deletion of the user, club or event it refers
 * to, so it can never be orphaned or cascade-deleted. {@code createdAt} (from
 * {@link BaseEntity}) is the time the action occurred.
 */
@Entity
@Table(
        name = "audit_logs",
        indexes = {
                @Index(name = "idx_audit_actor", columnList = "actor_id"),
                @Index(name = "idx_audit_action", columnList = "action"),
                @Index(name = "idx_audit_created", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    /** Id of the admin who performed the action (kept even if that account is later deleted). */
    @Column(name = "actor_id")
    private Long actorId;

    /** Snapshot of the actor's display name at the time of the action. */
    @Column(name = "actor_name", length = 150)
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AuditAction action;

    /** The kind of thing acted upon, e.g. "USER", "CLUB", "EVENT". */
    @Column(name = "target_type", length = 40)
    private String targetType;

    /** Id of the affected entity (may point at a now-deleted row). */
    @Column(name = "target_id")
    private Long targetId;

    /** Snapshot label of the target (name/title/email) for readable history. */
    @Column(name = "target_label", length = 255)
    private String targetLabel;

    /** Optional human-readable summary of what changed, e.g. "STUDENT → CLUB_COORDINATOR". */
    @Column(length = 500)
    private String detail;
}
