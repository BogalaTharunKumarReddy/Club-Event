package com.campusconnect.repository;

import com.campusconnect.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    List<Competition> findByEventId(Long eventId);
}
