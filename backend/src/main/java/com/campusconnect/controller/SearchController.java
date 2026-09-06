package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.response.GlobalSearchResponse;
import com.campusconnect.entity.enums.Role;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Aggregated global search across events, clubs and (for admins) users.
 *
 * <p>Public — works for anonymous visitors, who see published events and active
 * clubs only. A signed-in viewer additionally gets saved/followed flags on the
 * results; a platform admin additionally gets matching users.
 */
@Tag(name = "Search", description = "Global cross-entity search")
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @Operation(summary = "Global search across events, clubs and (admins only) users")
    @GetMapping
    public ApiResponse<GlobalSearchResponse> search(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "5") int limit) {
        Long viewerId = principal != null ? principal.getId() : null;
        boolean isAdmin = principal != null && principal.getRole() == Role.ADMIN;
        return ApiResponse.success(searchService.search(q, viewerId, isAdmin, limit));
    }
}
