package com.campusconnect.repository;

import com.campusconnect.entity.EventSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventScheduleRepository extends JpaRepository<EventSchedule, Long> {

    List<EventSchedule> findByEventIdOrderByStartDateTimeAsc(Long eventId);
}
