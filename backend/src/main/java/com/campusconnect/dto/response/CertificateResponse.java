package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.CertificateType;

import java.time.Instant;

public record CertificateResponse(
        Long id,
        Long userId,
        String userName,
        Long eventId,
        String eventTitle,
        CertificateType type,
        String title,
        String certificateCode,
        String verifyUrl,
        Instant issuedAt,
        boolean revoked,
        Instant revokedAt
) {
}
