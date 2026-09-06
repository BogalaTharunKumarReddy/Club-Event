package com.campusconnect.repository;

import com.campusconnect.entity.Judge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JudgeRepository extends JpaRepository<Judge, Long> {

    List<Judge> findByCompetitionId(Long competitionId);

    Optional<Judge> findByCompetitionIdAndUserId(Long competitionId, Long userId);

    boolean existsByCompetitionIdAndUserId(Long competitionId, Long userId);
}
