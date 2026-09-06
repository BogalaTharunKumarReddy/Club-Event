package com.campusconnect.repository;

import com.campusconnect.entity.CertificateTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, Long> {

    /** The template bound to a specific event, if one has been configured. */
    Optional<CertificateTemplate> findByEventId(Long eventId);

    /** Reusable, admin-curated library templates (not bound to any event). */
    List<CertificateTemplate> findByEventIsNullOrderByNameAsc();
}
