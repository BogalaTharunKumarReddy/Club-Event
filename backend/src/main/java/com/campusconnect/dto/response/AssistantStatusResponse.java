package com.campusconnect.dto.response;

/**
 * Whether the in-app assistant is available. The frontend calls this to decide
 * whether to surface the chat widget at all, so a deployment without an AI key
 * simply never shows it (rather than showing a broken button).
 */
public record AssistantStatusResponse(boolean enabled) {
}
