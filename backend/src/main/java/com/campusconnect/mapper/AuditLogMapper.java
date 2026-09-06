package com.campusconnect.mapper;

import com.campusconnect.dto.response.AuditLogResponse;
import com.campusconnect.entity.AuditLog;

public final class AuditLogMapper {

    private AuditLogMapper() {
    }

    public static AuditLogResponse toResponse(AuditLog log) {
        if (log == null) {
            return null;
        }
        return new AuditLogResponse(
                log.getId(),
                log.getActorId(),
                log.getActorName(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getTargetLabel(),
                log.getDetail(),
                log.getCreatedAt()
        );
    }
}
