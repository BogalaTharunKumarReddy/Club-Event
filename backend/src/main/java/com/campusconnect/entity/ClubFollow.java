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
 * A lightweight "follow" relationship: a user opts in to hear about a club's new
 * events and announcements. Distinct from {@link ClubMember} — following implies
 * no membership, role or approval, and carries no permissions. {@code createdAt}
 * (from {@link BaseEntity}) records when the user started following.
 */
@Entity
@Table(
        name = "club_follows",
        indexes = {
                @Index(name = "idx_clubfollow_club", columnList = "club_id"),
                @Index(name = "idx_clubfollow_user", columnList = "user_id")
        },
        uniqueConstraints = @UniqueConstraint(name = "uk_club_follow", columnNames = {"club_id", "user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubFollow extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
