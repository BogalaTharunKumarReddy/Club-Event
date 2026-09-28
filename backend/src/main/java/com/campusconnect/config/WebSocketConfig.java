package com.campusconnect.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
<<<<<<< HEAD
import org.springframework.messaging.simp.config.ChannelRegistration;
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

/**
 * STOMP-over-WebSocket configuration.
 *
 * <p>Clients connect to {@code /ws} (SockJS enabled) and subscribe to broker destinations
 * under {@code /topic} — e.g. {@code /topic/competitions/{id}/leaderboard} for live leaderboards
 * and {@code /topic/notifications/{userId}} for per-user notifications.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final String[] allowedOrigins;
<<<<<<< HEAD
    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

    public WebSocketConfig(@Value("${app.cors.allowed-origins}") String allowedOrigins,
                           StompAuthChannelInterceptor stompAuthChannelInterceptor) {
=======

    public WebSocketConfig(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
<<<<<<< HEAD
        this.stompAuthChannelInterceptor = stompAuthChannelInterceptor;
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
<<<<<<< HEAD

    /** Authenticates STOMP CONNECT and authorizes SUBSCRIBE (see {@link StompAuthChannelInterceptor}). */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompAuthChannelInterceptor);
    }
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
}
