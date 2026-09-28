package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * A single turn in a conversation with the in-app help assistant.
 *
 * <p>{@code history} carries the recent prior turns so the model has context; it
 * is optional and is trimmed/sanitised server-side. Only {@code role} values of
 * "user" and "assistant" are forwarded — the system prompt is always set by the
 * server and can never be supplied or overridden by the client.
 */
public record AssistantChatRequest(
        @NotBlank(message = "Message is required")
        @Size(max = 2000, message = "Message must be 2000 characters or fewer")
        String message,

        @Size(max = 20, message = "Too many prior messages")
        List<Turn> history
) {
    public record Turn(
            @Size(max = 20) String role,
            @Size(max = 4000) String content
    ) {}
}
