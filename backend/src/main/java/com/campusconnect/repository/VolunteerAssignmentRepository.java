package com.campusconnect.repository;

import com.campusconnect.entity.VolunteerAssignment;
import com.campusconnect.entity.enums.VolunteerAssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerAssignmentRepository extends JpaRepository<VolunteerAssignment, Long> {

    List<VolunteerAssignment> findByVolunteerId(Long volunteerId);

    List<VolunteerAssignment> findByVolunteerIdIn(List<Long> volunteerIds);

    List<VolunteerAssignment> findByEventId(Long eventId);

    Optional<VolunteerAssignment> findByVolunteerIdAndEventId(Long volunteerId, Long eventId);

    boolean existsByVolunteerIdAndEventId(Long volunteerId, Long eventId);

    long countByEventId(Long eventId);

    long countByVolunteerIdAndStatus(Long volunteerId, VolunteerAssignmentStatus status);
}
