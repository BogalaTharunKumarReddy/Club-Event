package com.campusconnect.service;

import com.campusconnect.dto.request.AddTeamMemberRequest;
import com.campusconnect.dto.request.TeamRequest;
import com.campusconnect.dto.response.TeamMemberResponse;
import com.campusconnect.dto.response.TeamResponse;

import java.util.List;

public interface TeamService {

    TeamResponse create(Long userId, TeamRequest request);

    TeamResponse getById(Long teamId);

    List<TeamResponse> listByEvent(Long eventId);

    TeamMemberResponse addMember(Long actingUserId, Long teamId, AddTeamMemberRequest request);

    void removeMember(Long actingUserId, Long teamId, Long membershipId);

    void deleteTeam(Long actingUserId, Long teamId);

    List<TeamResponse> myTeams(Long userId);
}
