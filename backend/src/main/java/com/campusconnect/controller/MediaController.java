package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.request.MediaRequest;
import com.campusconnect.dto.response.MediaResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.MediaService;
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
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "Event and club photo/video galleries")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add a media item to an event or club gallery (admin or active club member)")
    public ApiResponse<MediaResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                             @Valid @RequestBody MediaRequest request) {
        return ApiResponse.success("Media added",
                mediaService.create(principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a media item (uploader, or an admin/coordinator of the owning club)")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long id) {
        mediaService.delete(principal.getId(), id);
        return ApiResponse.message("Media deleted");
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Media gallery for an event")
    public ApiResponse<List<MediaResponse>> byEvent(@PathVariable Long eventId) {
        return ApiResponse.success(mediaService.listByEvent(eventId));
    }

    @GetMapping("/club/{clubId}")
    @Operation(summary = "Media gallery for a club")
    public ApiResponse<List<MediaResponse>> byClub(@PathVariable Long clubId) {
        return ApiResponse.success(mediaService.listByClub(clubId));
    }
}
