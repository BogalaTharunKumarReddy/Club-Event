package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.AuditAction;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        Long actorId,
        String actorName,
        AuditAction action,
        String targetType,
        Long targetId,
        String targetLabel,
        String detail,
        Instant createdAt
) {
}
