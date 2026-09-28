package com.campusconnect.service.impl;

import com.campusconnect.common.PageResponse;
import com.campusconnect.dto.response.AuditLogResponse;
import com.campusconnect.entity.AuditLog;
import com.campusconnect.entity.enums.AuditAction;
import com.campusconnect.mapper.AuditLogMapper;
import com.campusconnect.repository.AuditLogRepository;
import com.campusconnect.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditServiceImpl.class);

    private final AuditLogRepository auditLogRepository;

    /**
     * Writes in a REQUIRES_NEW transaction so the audit row commits independently
     * of the audited operation, and wraps everything in a try/catch so a logging
     * failure can never roll back or propagate into the caller's business logic.
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(Long actorId, String actorName, AuditAction action,
                       String targetType, Long targetId, String targetLabel, String detail) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .actorId(actorId)
                    .actorName(actorName)
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .targetLabel(truncate(targetLabel, 255))
                    .detail(truncate(detail, 500))
                    .build());
        } catch (Exception ex) {
            // Never let an audit-logging problem break the operation being audited.
            log.warn("Failed to record audit entry action={} target={}#{}", action, targetType, targetId, ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> list(AuditAction action, Pageable pageable) {
        return PageResponse.from(auditLogRepository.search(action, pageable), AuditLogMapper::toResponse);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
