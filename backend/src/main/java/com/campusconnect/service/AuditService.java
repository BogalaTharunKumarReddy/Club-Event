package com.campusconnect.service;

import com.campusconnect.common.PageResponse;
import com.campusconnect.dto.response.AuditLogResponse;
import com.campusconnect.entity.enums.AuditAction;
import org.springframework.data.domain.Pageable;

/**
 * Records and exposes the administrative audit trail. Recording is best-effort:
 * a failure to write an audit row must never abort the operation being audited.
 */
public interface AuditService {

    /**
     * Persist an audit entry. Implementations swallow any error so a logging
     * failure cannot roll back or break the caller's business operation.
     */
    void record(Long actorId, String actorName, AuditAction action,
                String targetType, Long targetId, String targetLabel, String detail);

    PageResponse<AuditLogResponse> list(AuditAction action, Pageable pageable);
}
