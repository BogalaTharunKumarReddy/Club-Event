package com.campusconnect.entity;

import com.campusconnect.entity.enums.CertificateRecipientScope;
import com.campusconnect.entity.enums.CertificateType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A reusable certificate design.
 *
 * <p>Two flavours share one table, distinguished by {@link #event}:
 * <ul>
 *   <li><b>Event template</b> ({@code event != null}) — the single design used when issuing
 *       certificates for that event. At most one per event (enforced in the service layer).</li>
 *   <li><b>Library template</b> ({@code event == null}) — an admin-curated design that can be
 *       copied onto any event.</li>
 * </ul>
 *
 * <p>The layout model is deliberately simple and robust: a full-page {@link #backgroundImageUrl}
 * (optional — falls back to the built-in decorative design) with a handful of horizontally-centred
 * text lines whose vertical position is given as a normalized fraction of the page height
 * ({@code 0.0} = top, {@code 1.0} = bottom). This is enough to drop a name/event/date onto most
 * pre-designed certificate backgrounds without a full drag-and-drop editor.
 */
@Entity
@Table(
        name = "certificate_templates",
        indexes = {
                @Index(name = "idx_cert_tpl_event", columnList = "event_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateTemplate extends BaseEntity {

    /** Display name (shown in the admin library and the coordinator editor). */
    @Column(nullable = false, length = 120)
    private String name;

    /**
     * The owning event, or {@code null} for a reusable library template.
     * A OneToOne so each event has at most one template row.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    /**
     * Public URL (http/https) or {@code data:} URL of the full-page background design.
     * When blank, the built-in decorative border design is rendered instead.
     */
    @Column(length = 2048)
    private String backgroundImageUrl;

    // ---- text content (placeholders are resolved at render time) ----

    /** Heading, e.g. "Certificate of Participation". Blank → per-type default at issue time. */
    @Column(length = 180)
    private String titleText;

    @Column(length = 160)
    @Builder.Default
    private String presentedToText = "This is proudly presented to";

    @Column(length = 200)
    @Builder.Default
    private String bodyText = "for outstanding participation in";

    // ---- which lines to draw ----

    @Column(nullable = false)
    @Builder.Default
    private boolean showTitle = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean showPresentedTo = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean showBody = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean showEvent = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean showDate = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean showQr = true;

    // ---- vertical positions (normalized 0..1 from the top of the page) ----

    @Column(nullable = false)
    @Builder.Default
    private double titleY = 0.24;

    @Column(nullable = false)
    @Builder.Default
    private double presentedToY = 0.36;

    @Column(nullable = false)
    @Builder.Default
    private double nameY = 0.46;

    @Column(nullable = false)
    @Builder.Default
    private double bodyY = 0.57;

    @Column(nullable = false)
    @Builder.Default
    private double eventY = 0.64;

    @Column(nullable = false)
    @Builder.Default
    private double dateY = 0.75;

    @Column(nullable = false)
    @Builder.Default
    private double qrY = 0.86;

    // ---- font sizes (points) ----

    @Column(nullable = false)
    @Builder.Default
    private int titleFontSize = 30;

    @Column(nullable = false)
    @Builder.Default
    private int nameFontSize = 34;

    @Column(nullable = false)
    @Builder.Default
    private int bodyFontSize = 14;

    @Column(nullable = false)
    @Builder.Default
    private int eventFontSize = 20;

    // ---- colours (#RRGGBB) ----

    @Column(length = 9)
    @Builder.Default
    private String titleColor = "#1E3A8A";

    @Column(length = 9)
    @Builder.Default
    private String nameColor = "#0F172A";

    @Column(length = 9)
    @Builder.Default
    private String bodyColor = "#334155";

    // ---- issuing behaviour ----

    /** When true, participants without a SUCCESS payment are skipped during generation. */
    @Column(nullable = false)
    @Builder.Default
    private boolean requirePayment = false;

    /** When true, certificates are auto-issued when the event is marked COMPLETED. */
    @Column(nullable = false)
    @Builder.Default
    private boolean autoIssueOnComplete = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    @Builder.Default
    private CertificateRecipientScope autoIssueScope = CertificateRecipientScope.ATTENDED;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private CertificateType autoIssueType = CertificateType.PARTICIPATION;
}
