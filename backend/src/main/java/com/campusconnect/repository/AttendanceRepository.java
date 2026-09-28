package com.campusconnect.repository;

import com.campusconnect.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByRegistrationId(Long registrationId);

    boolean existsByRegistrationId(Long registrationId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    List<Attendance> findByEventId(Long eventId);

    List<Attendance> findByUserId(Long userId);

    long countByEventId(Long eventId);
}
