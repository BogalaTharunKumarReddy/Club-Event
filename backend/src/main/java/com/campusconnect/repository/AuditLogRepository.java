package com.campusconnect.repository;

import com.campusconnect.entity.AuditLog;
import com.campusconnect.entity.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Paged audit history with an optional action filter. A single query with a
     * null-guarded predicate keeps the controller simple and lets the database
     * use the {@code action}/{@code created_at} indexes.
     */
    @Query("""
            select a from AuditLog a
            where (:action is null or a.action = :action)
            """)
    Page<AuditLog> search(@Param("action") AuditAction action, Pageable pageable);
}
