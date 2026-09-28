package com.campusconnect.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Selects the active {@link StorageService} based on {@code app.storage.provider}. All registered
 * storage beans are discovered automatically (the S3 backend only registers when selected), so
 * adding a provider requires no changes here — mirrors {@code PaymentGatewayResolver}.
 */
@Component
@Slf4j
public class StorageResolver {

    private final Map<String, StorageService> byProvider;
    private final String configuredProvider;

    public StorageResolver(List<StorageService> services,
                           @Value("${app.storage.provider:local}") String configuredProvider) {
        this.byProvider = services.stream()
                .collect(Collectors.toMap(s -> s.provider().toLowerCase(Locale.ROOT), Function.identity()));
        this.configuredProvider = configuredProvider == null ? "local" : configuredProvider.toLowerCase(Locale.ROOT);
        log.info("Storage backends registered: {} — active provider: '{}'",
                byProvider.keySet(), this.configuredProvider);
    }

    public StorageService resolve() {
        StorageService service = byProvider.get(configuredProvider);
        if (service == null) {
            throw new IllegalStateException(
                    "No storage backend is configured for provider '" + configuredProvider
                            + "'. Available: " + byProvider.keySet());
        }
        return service;
    }

    public String activeProvider() {
        return configuredProvider;
    }
}
