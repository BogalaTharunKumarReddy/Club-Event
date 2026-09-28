package com.campusconnect.config;

import com.campusconnect.entity.enums.Role;
import com.campusconnect.security.CustomUserDetailsService;
import com.campusconnect.security.JwtService;
import com.campusconnect.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * Authenticates and authorizes STOMP frames on the client inbound channel.
 *
 * <p>The {@code /ws} HTTP handshake is {@code permitAll} (SockJS cannot carry the bearer
 * header), so authentication happens here instead:
 * <ul>
 *   <li><b>CONNECT</b> — if an {@code Authorization: Bearer <jwt>} native header is present it
 *       is validated with the same {@link JwtService}/{@link CustomUserDetailsService} used by
 *       the REST filter, and the resulting principal is bound to the STOMP session. A missing
 *       token yields an anonymous session (public topics only); a present-but-invalid token is
 *       rejected.</li>
 *   <li><b>SUBSCRIBE</b> — subscriptions to a per-user topic
 *       ({@code /topic/notifications/{userId}}) require an authenticated principal whose id
 *       matches {@code {userId}} (ADMIN exempt). This closes an IDOR where any client could
 *       read another user's private notifications. Public topics pass through unchanged.</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String USER_TOPIC_PREFIX = "/topic/notifications/";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        switch (accessor.getCommand()) {
            case CONNECT -> authenticate(accessor);
            case SUBSCRIBE -> authorizeSubscription(accessor);
            default -> { /* other frames rely on the CONNECT-time principal */ }
        }
        return message;
    }

    /** Binds a principal to the session from the CONNECT Authorization header, if any. */
    private void authenticate(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            // Anonymous connection — allowed, but private subscriptions will be denied below.
            return;
        }
        String token = header.substring(BEARER_PREFIX.length());
        try {
            String email = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (!jwtService.isTokenValid(token, userDetails)) {
                throw new MessagingException("Invalid or expired token on STOMP CONNECT.");
            }
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            accessor.setUser(authentication);
        } catch (MessagingException ex) {
            throw ex;
        } catch (Exception ex) {
            // Malformed token / unknown user — reject the connection rather than fall back to anonymous.
            throw new MessagingException("STOMP authentication failed.", ex);
        }
    }

    /** Enforces owner-or-admin access on the per-user notification topic. */
    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith(USER_TOPIC_PREFIX)) {
            return; // public topics (e.g. leaderboards) need no per-user check
        }

        UserPrincipal principal = currentPrincipal(accessor.getUser());
        if (principal == null) {
            throw new MessagingException("Authentication required to subscribe to notifications.");
        }
        if (principal.getRole() == Role.ADMIN) {
            return;
        }

        String requestedId = destination.substring(USER_TOPIC_PREFIX.length());
        if (!String.valueOf(principal.getId()).equals(requestedId)) {
            log.warn("Blocked cross-user notification subscribe: user {} -> {}", principal.getId(), destination);
            throw new MessagingException("You can only subscribe to your own notifications.");
        }
    }

    private UserPrincipal currentPrincipal(Principal user) {
        if (user instanceof Authentication auth && auth.getPrincipal() instanceof UserPrincipal up) {
            return up;
        }
        return null;
    }
}
