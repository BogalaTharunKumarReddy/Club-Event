package com.campusconnect.repository;

import com.campusconnect.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

    List<Volunteer> findByEventId(Long eventId);

    List<Volunteer> findByEventIdAndApprovedTrue(Long eventId);

    List<Volunteer> findByUserId(Long userId);

    Optional<Volunteer> findByEventIdAndUserId(Long eventId, Long userId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    long countByEventIdAndApprovedTrue(Long eventId);
}
