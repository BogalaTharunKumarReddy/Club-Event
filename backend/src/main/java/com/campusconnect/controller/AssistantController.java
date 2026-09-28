package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.request.AssistantChatRequest;
import com.campusconnect.dto.response.AssistantChatResponse;
import com.campusconnect.dto.response.AssistantStatusResponse;
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.AssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * In-app help assistant. Both endpoints require authentication (enforced by the
 * default {@code anyRequest().authenticated()} rule in SecurityConfig), so the
 * assistant is only reachable by signed-in users. The provider API key lives only
 * on the server and is never returned to the client.
 */
@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
@Tag(name = "Assistant", description = "In-app AI help assistant for students and staff")
public class AssistantController {

    private final AssistantService assistantService;

    @GetMapping("/status")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Whether the in-app assistant is configured and available")
    public ApiResponse<AssistantStatusResponse> status() {
        return ApiResponse.success(new AssistantStatusResponse(assistantService.isEnabled()));
    }

    @PostMapping("/chat")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Ask the assistant a question about using CampusConnect")
    public ApiResponse<AssistantChatResponse> chat(@AuthenticationPrincipal UserPrincipal principal,
                                                   @Valid @RequestBody AssistantChatRequest request) {
        return ApiResponse.success(assistantService.chat(principal.getId(), request));
    }
}
