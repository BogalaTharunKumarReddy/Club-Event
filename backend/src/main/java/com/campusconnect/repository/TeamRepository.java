package com.campusconnect.repository;

import com.campusconnect.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByEventId(Long eventId);

    boolean existsByEventIdAndName(Long eventId, String name);
}
