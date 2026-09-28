package com.campusconnect.repository;

import com.campusconnect.entity.VolunteerAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerAttendanceRepository extends JpaRepository<VolunteerAttendance, Long> {

    List<VolunteerAttendance> findByVolunteerId(Long volunteerId);

    List<VolunteerAttendance> findByEventId(Long eventId);

    Optional<VolunteerAttendance> findByVolunteerIdAndEventId(Long volunteerId, Long eventId);

    boolean existsByVolunteerIdAndEventId(Long volunteerId, Long eventId);
}
