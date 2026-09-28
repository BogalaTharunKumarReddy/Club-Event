package com.campusconnect.service;

import com.campusconnect.dto.request.AssistantChatRequest;
import com.campusconnect.dto.response.AssistantChatResponse;

/**
 * In-app help assistant. Implementations proxy to an external, OpenAI-compatible
 * chat-completions provider using a server-side API key that is never exposed to
 * the client. The assistant is optional: when no key is configured the feature
 * degrades gracefully ({@link #isEnabled()} returns {@code false} and
 * {@link #chat} reports the service as unavailable).
 */
public interface AssistantService {

    /** True when a provider and API key are configured and the feature is enabled. */
    boolean isEnabled();

    /**
     * Answer a user's question grounded on CampusConnect. The server sets the
     * system prompt; the client may only supply the user message and prior turns.
     *
     * @param userId the authenticated caller (for rate limiting / auditing)
     */
    AssistantChatResponse chat(Long userId, AssistantChatRequest request);
}
