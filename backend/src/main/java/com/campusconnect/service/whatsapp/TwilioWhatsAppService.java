package com.campusconnect.service.whatsapp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Real WhatsApp provider backed by Twilio's Programmable Messaging API. It speaks the REST API
 * directly over the JDK {@link HttpClient} (Basic auth with the Account SID + Auth Token), so no
 * vendor SDK / extra Maven dependency is required — the same approach as {@code RazorpayPaymentGateway}.
 *
 * <p>Credentials are read from the environment ({@code TWILIO_ACCOUNT_SID} / {@code TWILIO_AUTH_TOKEN})
 * and never leave this bean or reach the client. This bean is only selected when
 * {@code app.whatsapp.provider=twilio}; with blank credentials it constructs fine but reports
 * {@link #isEnabled()} == false and logs instead of calling Twilio.
 *
 * <p>Sends are {@code @Async} and fail-soft: a Twilio outage or a bad number is logged and swallowed
 * so it can never disrupt the payment settlement that triggered the message. Only plain text is sent
 * (no media): a WhatsApp media URL must be publicly reachable over HTTPS, which the QR image is not,
 * so the QR code travels on the confirmation email while WhatsApp carries the ticket code and link.
 */
@Component
@Slf4j
public class TwilioWhatsAppService implements WhatsAppService {

    private static final String PROVIDER = "twilio";

    private final String accountSid;
    private final String authToken;
    private final String fromAddress;
    private final String defaultCountryCode;
    private final String baseUrl;
    private final HttpClient httpClient;

    public TwilioWhatsAppService(
            @Value("${app.whatsapp.twilio.account-sid:}") String accountSid,
            @Value("${app.whatsapp.twilio.auth-token:}") String authToken,
            @Value("${app.whatsapp.twilio.from:}") String from,
            @Value("${app.whatsapp.default-country-code:}") String defaultCountryCode,
            @Value("${app.whatsapp.twilio.base-url:https://api.twilio.com}") String baseUrl) {
        this.accountSid = accountSid == null ? "" : accountSid.trim();
        this.authToken = authToken == null ? "" : authToken.trim();
        this.fromAddress = normaliseFrom(from);
        this.defaultCountryCode = defaultCountryCode == null ? "" : defaultCountryCode.trim();
        String url = baseUrl == null || baseUrl.isBlank() ? "https://api.twilio.com" : baseUrl.trim();
        this.baseUrl = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
    }

    @Override
    public String provider() {
        return PROVIDER;
    }

    @Override
    public boolean isEnabled() {
        return !accountSid.isBlank() && !authToken.isBlank() && !fromAddress.isBlank();
    }

    @Async
    @Override
    public void sendText(String toPhone, String message) {
        if (!isEnabled()) {
            log.info("[WhatsApp twilio not configured] To: {} | Message:\n{}", toPhone, message);
            return;
        }
        Optional<String> to = WhatsAppNumbers.toWhatsAppAddress(toPhone, defaultCountryCode);
        if (to.isEmpty()) {
            log.warn("[twilio-whatsapp] Skipping send — could not derive an international number from '{}' "
                    + "(set a valid phone on the profile, or configure WHATSAPP_DEFAULT_COUNTRY_CODE).", toPhone);
            return;
        }

        Map<String, String> form = new LinkedHashMap<>();
        form.put("From", fromAddress);
        form.put("To", to.get());
        form.put("Body", message == null ? "" : message);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/2010-04-01/Accounts/" + accountSid + "/Messages.json"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", basicAuthHeader())
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(urlEncode(form), StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 == 2) {
                log.info("[twilio-whatsapp] Message queued to {}", to.get());
            } else {
                // Body may contain a Twilio error message; log at warn without failing the caller.
                log.warn("[twilio-whatsapp] Send to {} failed: HTTP {} — {}",
                        to.get(), response.statusCode(), response.body());
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("[twilio-whatsapp] Send to {} was interrupted", to.get());
        } catch (Exception ex) {
            // Fail-soft: never let a messaging problem propagate into the payment flow.
            log.warn("[twilio-whatsapp] Send to {} failed: {}", to.get(), ex.getMessage());
        }
    }

    // --------------------------------------------------------------------

    /** Twilio WhatsApp senders are addressed as {@code whatsapp:+E164}; accept it with or without the prefix. */
    private static String normaliseFrom(String from) {
        if (from == null || from.isBlank()) {
            return "";
        }
        String trimmed = from.trim();
        return trimmed.startsWith("whatsapp:") ? trimmed : "whatsapp:" + trimmed;
    }

    private String basicAuthHeader() {
        String token = Base64.getEncoder()
                .encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
        return "Basic " + token;
    }

    private static String urlEncode(Map<String, String> form) {
        return form.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8)
                        + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }
}
