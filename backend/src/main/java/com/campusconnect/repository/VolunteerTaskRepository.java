package com.campusconnect.repository;

import com.campusconnect.entity.VolunteerTask;
import com.campusconnect.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VolunteerTaskRepository extends JpaRepository<VolunteerTask, Long> {

    List<VolunteerTask> findByVolunteerId(Long volunteerId);

    List<VolunteerTask> findByVolunteerIdIn(List<Long> volunteerIds);

    List<VolunteerTask> findByVolunteerEventId(Long eventId);

    List<VolunteerTask> findByVolunteerUserId(Long userId);

    long countByVolunteerId(Long volunteerId);

    long countByVolunteerIdAndStatus(Long volunteerId, TaskStatus status);

    void deleteByVolunteerId(Long volunteerId);
}
