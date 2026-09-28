package com.campusconnect.service.whatsapp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Selects the active {@link WhatsAppService} based on {@code app.whatsapp.provider}, mirroring
 * {@code PaymentGatewayResolver}. All registered provider beans are discovered automatically, so
 * adding a provider requires no changes here. Falls back to the {@code log} (no-op) provider if the
 * configured name is unknown, so a mis-set value degrades gracefully to logging rather than failing
 * the app at runtime.
 */
@Component
@Slf4j
public class WhatsAppResolver {

    private static final String FALLBACK_PROVIDER = "log";

    private final Map<String, WhatsAppService> byProvider;
    private final String configuredProvider;

    public WhatsAppResolver(List<WhatsAppService> providers,
                            @Value("${app.whatsapp.provider:log}") String configuredProvider) {
        this.byProvider = providers.stream()
                .collect(Collectors.toMap(p -> p.provider().toLowerCase(Locale.ROOT), Function.identity()));
        this.configuredProvider = configuredProvider == null || configuredProvider.isBlank()
                ? FALLBACK_PROVIDER : configuredProvider.toLowerCase(Locale.ROOT);
        log.info("WhatsApp providers registered: {} — active provider: '{}'",
                byProvider.keySet(), this.configuredProvider);
    }

    /** The active WhatsApp provider; never null (falls back to the logging no-op). */
    public WhatsAppService resolve() {
        WhatsAppService provider = byProvider.get(configuredProvider);
        if (provider == null) {
            log.warn("No WhatsApp provider registered for '{}'; falling back to '{}'. Available: {}",
                    configuredProvider, FALLBACK_PROVIDER, byProvider.keySet());
            provider = byProvider.get(FALLBACK_PROVIDER);
        }
        return provider;
    }
}
