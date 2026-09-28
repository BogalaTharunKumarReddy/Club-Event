package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.CertificateType;

import java.time.Instant;

/**
 * Public, privacy-conscious result of verifying a certificate by its code. Only the minimum
 * needed to confirm authenticity is exposed — no emails, ids or other personal data.
 *
 * <p>Three outcomes are distinguishable by the client:
 * <ul>
 *   <li>{@code valid=true}  — genuine, active certificate;</li>
 *   <li>{@code valid=false, revoked=true} — a real certificate that has since been revoked
 *       (recipient/event are still returned so the verifier knows what was revoked);</li>
 *   <li>{@code valid=false, revoked=false} — no certificate matches the code.</li>
 * </ul>
 */
public record CertificateVerificationResponse(
        boolean valid,
        boolean revoked,
        String recipientName,
        String eventTitle,
        CertificateType type,
        String title,
        Instant issuedAt,
        Instant revokedAt
) {
    public static CertificateVerificationResponse invalid() {
        return new CertificateVerificationResponse(false, false, null, null, null, null, null, null);
    }
}
