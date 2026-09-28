package com.campusconnect.mapper;

import com.campusconnect.dto.response.CertificateResponse;
import com.campusconnect.dto.response.CertificateVerificationResponse;
import com.campusconnect.entity.Certificate;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;

public final class CertificateMapper {

    private CertificateMapper() {
    }

    public static CertificateResponse toResponse(Certificate certificate, String verifyUrl) {
        if (certificate == null) {
            return null;
        }
        User user = certificate.getUser();
        Event event = certificate.getEvent();
        return new CertificateResponse(
                certificate.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                certificate.getType(),
                certificate.getTitle(),
                certificate.getCertificateCode(),
                verifyUrl,
                certificate.getIssuedAt(),
                certificate.isRevoked(),
                certificate.getRevokedAt()
        );
    }

    public static CertificateVerificationResponse toVerification(Certificate certificate) {
        if (certificate == null) {
            return CertificateVerificationResponse.invalid();
        }
        User user = certificate.getUser();
        Event event = certificate.getEvent();
        boolean revoked = certificate.isRevoked();
        return new CertificateVerificationResponse(
                !revoked,
                revoked,
                user != null ? user.getFullName() : null,
                event != null ? event.getTitle() : null,
                certificate.getType(),
                certificate.getTitle(),
                certificate.getIssuedAt(),
                certificate.getRevokedAt()
        );
    }
}
