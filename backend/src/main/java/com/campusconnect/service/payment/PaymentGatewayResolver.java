package com.campusconnect.service.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Selects the active {@link PaymentGateway} based on {@code app.payment.provider}. All registered
 * gateway beans are discovered automatically, so adding a provider requires no changes here.
 */
@Component
@Slf4j
public class PaymentGatewayResolver {

    private final Map<String, PaymentGateway> gatewaysByProvider;
    private final String configuredProvider;

    public PaymentGatewayResolver(List<PaymentGateway> gateways,
                                  @Value("${app.payment.provider:mock}") String configuredProvider) {
        this.gatewaysByProvider = gateways.stream()
                .collect(Collectors.toMap(g -> g.provider().toLowerCase(Locale.ROOT), Function.identity()));
        this.configuredProvider = configuredProvider == null ? "mock" : configuredProvider.toLowerCase(Locale.ROOT);
        log.info("Payment gateways registered: {} — active provider: '{}'",
                gatewaysByProvider.keySet(), this.configuredProvider);
    }

    public PaymentGateway resolve() {
        PaymentGateway gateway = gatewaysByProvider.get(configuredProvider);
        if (gateway == null) {
            throw new IllegalStateException(
                    "No payment gateway is configured for provider '" + configuredProvider
                            + "'. Available: " + gatewaysByProvider.keySet());
        }
        return gateway;
    }

    /**
     * Resolve the gateway that originally handled a payment (by its stored provider name), so
     * operations like refunds are routed to the correct provider even after {@code
     * app.payment.provider} is later switched. Falls back to the active provider when the stored
     * name is blank (e.g. legacy rows).
     */
    public PaymentGateway resolve(String provider) {
        if (provider == null || provider.isBlank()) {
            return resolve();
        }
        PaymentGateway gateway = gatewaysByProvider.get(provider.toLowerCase(Locale.ROOT));
        if (gateway == null) {
            throw new IllegalStateException(
                    "No payment gateway is registered for provider '" + provider
                            + "'. Available: " + gatewaysByProvider.keySet());
        }
        return gateway;
    }

    public String activeProvider() {
        return configuredProvider;
    }
}
