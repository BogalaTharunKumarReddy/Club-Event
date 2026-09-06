package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.request.AddTeamMemberRequest;
import com.campusconnect.dto.request.TeamRequest;
import com.campusconnect.dto.response.TeamMemberResponse;
import com.campusconnect.dto.response.TeamResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Teams", description = "Team creation and membership for team events")
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a team for a team event (creator becomes leader)")
    public ApiResponse<TeamResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                            @Valid @RequestBody TeamRequest request) {
        return ApiResponse.success("Team created", teamService.create(principal.getId(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a team with its members")
    public ApiResponse<TeamResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(teamService.getById(id));
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "List all teams for an event")
    public ApiResponse<List<TeamResponse>> listByEvent(@PathVariable Long eventId) {
        return ApiResponse.success(teamService.listByEvent(eventId));
    }

    @GetMapping("/me")
    @Operation(summary = "List teams I belong to")
    public ApiResponse<List<TeamResponse>> myTeams(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(teamService.myTeams(principal.getId()));
    }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a member to a team by email (leader only)")
    public ApiResponse<TeamMemberResponse> addMember(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long id,
                                                     @Valid @RequestBody AddTeamMemberRequest request) {
        return ApiResponse.success("Member added", teamService.addMember(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}/members/{membershipId}")
    @Operation(summary = "Remove a member from a team (leader only)")
    public ApiResponse<Void> removeMember(@AuthenticationPrincipal UserPrincipal principal,
                                          @PathVariable Long id,
                                          @PathVariable Long membershipId) {
        teamService.removeMember(principal.getId(), id, membershipId);
        return ApiResponse.message("Member removed");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a team (leader only)")
    public ApiResponse<Void> deleteTeam(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable Long id) {
        teamService.deleteTeam(principal.getId(), id);
        return ApiResponse.message("Team deleted");
    }
}
