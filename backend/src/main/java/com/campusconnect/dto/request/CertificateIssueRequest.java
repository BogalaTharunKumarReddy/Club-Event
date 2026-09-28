package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.CertificateType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request to issue a certificate to a participant. The recipient is identified by email
 * (never by exposing internal user ids on the client). If {@code title} is blank a sensible
 * default is derived from the type and event.
 */
public record CertificateIssueRequest(
        @NotBlank @Email @Size(max = 160) String email,
        @NotNull Long eventId,
        CertificateType type,
        @Size(max = 180) String title
) {
}
