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
 * Media metadata (images/videos). Files themselves live in an external store
 * (Cloudinary / S3) referenced by {@code url}; only metadata is persisted here.
 */
@Entity
@Table(
        name = "media",
        indexes = {
                @Index(name = "idx_media_event", columnList = "event_id"),
                @Index(name = "idx_media_club", columnList = "club_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;

    @Column(nullable = false)
    private String url;

    /** IMAGE or VIDEO. */
    @Column(length = 16)
    private String mediaType;

    @Column(length = 200)
    private String caption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
}
