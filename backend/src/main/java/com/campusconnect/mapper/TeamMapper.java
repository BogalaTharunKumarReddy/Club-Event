package com.campusconnect.mapper;

import com.campusconnect.dto.response.TeamMemberResponse;
import com.campusconnect.dto.response.TeamResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Team;
import com.campusconnect.entity.TeamMember;
import com.campusconnect.entity.User;

import java.util.List;

public final class TeamMapper {

    private TeamMapper() {
    }

    public static TeamMemberResponse toMemberResponse(TeamMember member, Long leaderUserId) {
        if (member == null) {
            return null;
        }
        User user = member.getUser();
        Long userId = user != null ? user.getId() : null;
        return new TeamMemberResponse(
                member.getId(),
                member.getTeam() != null ? member.getTeam().getId() : null,
                userId,
                user != null ? user.getFullName() : null,
                user != null ? user.getEmail() : null,
                userId != null && userId.equals(leaderUserId),
                member.getCreatedAt()
        );
    }

    public static TeamResponse toResponse(Team team, List<TeamMember> members) {
        if (team == null) {
            return null;
        }
        Event event = team.getEvent();
        User leader = team.getLeader();
        Long leaderId = leader != null ? leader.getId() : null;
        List<TeamMemberResponse> memberResponses = members == null ? List.of()
                : members.stream().map(m -> toMemberResponse(m, leaderId)).toList();
        return new TeamResponse(
                team.getId(),
                team.getName(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                leaderId,
                leader != null ? leader.getFullName() : null,
                team.getMaxSize(),
                memberResponses.size(),
                memberResponses,
                team.getCreatedAt()
        );
    }
}
