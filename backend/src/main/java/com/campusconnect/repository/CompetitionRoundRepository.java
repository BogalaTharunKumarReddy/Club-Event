package com.campusconnect.repository;

import com.campusconnect.entity.CompetitionRound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetitionRoundRepository extends JpaRepository<CompetitionRound, Long> {

    List<CompetitionRound> findByCompetitionIdOrderByRoundNumberAsc(Long competitionId);
}
