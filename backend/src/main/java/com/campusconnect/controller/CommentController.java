package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.request.CommentRequest;
import com.campusconnect.dto.request.CommentUpdateRequest;
import com.campusconnect.dto.response.CommentResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Event discussion & Q&A")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Discussion thread for an event (public read)")
    public ApiResponse<List<CommentResponse>> byEvent(@PathVariable Long eventId) {
        return ApiResponse.success(commentService.listByEvent(eventId));
    }

    @PostMapping("/event/{eventId}")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Post a comment or question on an event (reply by setting parentId)")
    public ApiResponse<CommentResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable Long eventId,
                                               @Valid @RequestBody CommentRequest request) {
        return ApiResponse.success("Posted",
                commentService.create(principal.getId(), eventId, request));
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Edit your own comment")
    public ApiResponse<CommentResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable Long id,
                                               @Valid @RequestBody CommentUpdateRequest request) {
        return ApiResponse.success("Updated",
                commentService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a comment (author, or an admin/coordinator of the owning club)")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long id) {
        commentService.delete(principal.getId(), id);
        return ApiResponse.message("Comment deleted");
    }

    @PatchMapping("/{id}/pin")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Pin or unpin a top-level comment (admin/coordinator)")
    public ApiResponse<CommentResponse> setPinned(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable Long id,
                                                  @RequestParam boolean pinned) {
        return ApiResponse.success(commentService.setPinned(principal.getId(), id, pinned));
    }

    @PatchMapping("/{id}/resolve")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mark a question resolved or reopen it (admin/coordinator or author)")
    public ApiResponse<CommentResponse> setResolved(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable Long id,
                                                    @RequestParam boolean resolved) {
        return ApiResponse.success(commentService.setResolved(principal.getId(), id, resolved));
    }
}
