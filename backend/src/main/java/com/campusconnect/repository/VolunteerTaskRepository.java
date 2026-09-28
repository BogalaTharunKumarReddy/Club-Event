package com.campusconnect.repository;

import com.campusconnect.entity.VolunteerTask;
<<<<<<< HEAD
import com.campusconnect.entity.enums.VolunteerTaskStatus;
=======
import com.campusconnect.entity.enums.TaskStatus;
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VolunteerTaskRepository extends JpaRepository<VolunteerTask, Long> {

    List<VolunteerTask> findByVolunteerId(Long volunteerId);

    List<VolunteerTask> findByVolunteerIdIn(List<Long> volunteerIds);

<<<<<<< HEAD
    List<VolunteerTask> findByVolunteerIdAndStatus(Long volunteerId, VolunteerTaskStatus status);

    List<VolunteerTask> findByEventId(Long eventId);

    long countByVolunteerIdAndStatus(Long volunteerId, VolunteerTaskStatus status);
=======
    List<VolunteerTask> findByVolunteerEventId(Long eventId);

    List<VolunteerTask> findByVolunteerUserId(Long userId);

    long countByVolunteerId(Long volunteerId);

    long countByVolunteerIdAndStatus(Long volunteerId, TaskStatus status);

    void deleteByVolunteerId(Long volunteerId);
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
}
