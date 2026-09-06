package com.campusconnect.dto.response;

import java.util.List;

/**
 * Outcome of a batch certificate generation.
 *
 * @param issued  how many new certificates were created
 * @param skipped how many recipients were skipped (already had one, or blocked by the payment gate)
 * @param reasons short human-readable notes about skips, for surfacing in the UI
 */
public record CertificateBatchResponse(
        int issued,
        int skipped,
        List<String> reasons
) {
}
