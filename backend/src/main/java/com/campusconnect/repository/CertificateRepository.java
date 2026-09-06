package com.campusconnect.repository;

import com.campusconnect.entity.Certificate;
import com.campusconnect.entity.enums.CertificateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    List<Certificate> findByUserId(Long userId);

    List<Certificate> findByEventId(Long eventId);

    Optional<Certificate> findByCertificateCode(String certificateCode);

    boolean existsByUserIdAndEventIdAndType(Long userId, Long eventId, CertificateType type);
}
