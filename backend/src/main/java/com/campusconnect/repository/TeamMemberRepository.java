package com.campusconnect.repository;

import com.campusconnect.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByTeamId(Long teamId);

    List<TeamMember> findByUserId(Long userId);

    boolean existsByTeamIdAndUserId(Long teamId, Long userId);

    /** True when the user already belongs to any team registered under the given event. */
    boolean existsByTeam_Event_IdAndUserId(Long eventId, Long userId);

    long countByTeamId(Long teamId);
}
