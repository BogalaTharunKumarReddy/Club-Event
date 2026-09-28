package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.CertificateType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Request for a targeted bulk certificate generation: issue a certificate of {@code type} to the
 * explicitly-chosen participants. Unlike scope-based generation this carries the exact set of user
 * ids the coordinator selected in the participant picker. Every id is validated server-side against
 * the event's actual participants, so a client cannot smuggle in arbitrary users.
 *
 * @param userIds the participants to issue to (must be non-empty)
 * @param type    the certificate type; defaults to PARTICIPATION when omitted
 */
public record CertificateBulkIssueRequest(
        @NotNull @NotEmpty List<Long> userIds,
        CertificateType type
) {
}
