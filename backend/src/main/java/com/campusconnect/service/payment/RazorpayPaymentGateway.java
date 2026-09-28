package com.campusconnect.service.payment;

import com.campusconnect.entity.enums.PaymentStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Real Razorpay gateway (works against test-mode keys, {@code rzp_test_*}). It speaks Razorpay's
 * REST API directly over the JDK {@link HttpClient}, so no vendor SDK / extra Maven dependency is
 * needed.
 *
 * <p>Flow: {@link #charge} creates an <em>order</em> and returns {@code PENDING} with the order id
 * as the provider reference; the browser opens Razorpay Checkout for that order and, on success,
 * hands back {@code payment_id} + {@code signature}, which {@link #verify} checks with an
 * HMAC-SHA256 over {@code order_id|payment_id}. {@link #refund} calls the refunds API using the
 * captured payment id.
 *
 * <p>Credentials are read from the environment ({@code RAZORPAY_KEY_ID} / {@code RAZORPAY_KEY_SECRET});
 * the secret never leaves this bean and is never sent to the client. This gateway is only selected
 * when {@code app.payment.provider=razorpay}; with blank keys it constructs fine but fails fast with
 * a clear message the moment it is actually used.
 */
@Component
@Slf4j
public class RazorpayPaymentGateway implements PaymentGateway, ClientCheckoutGateway {

    private static final String PROVIDER = "razorpay";

    private final ObjectMapper objectMapper;
    private final String keyId;
    private final String keySecret;
    private final String baseUrl;
    private final HttpClient httpClient;

    public RazorpayPaymentGateway(ObjectMapper objectMapper,
                                  @Value("${app.payment.razorpay.key-id:}") String keyId,
                                  @Value("${app.payment.razorpay.key-secret:}") String keySecret,
                                  @Value("${app.payment.razorpay.base-url:https://api.razorpay.com/v1}") String baseUrl) {
        this.objectMapper = objectMapper;
        this.keyId = keyId == null ? "" : keyId.trim();
        this.keySecret = keySecret == null ? "" : keySecret.trim();
        String url = baseUrl == null || baseUrl.isBlank() ? "https://api.razorpay.com/v1" : baseUrl.trim();
        this.baseUrl = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
    }

    @Override
    public String provider() {
        return PROVIDER;
    }

    @Override
    public String publicKey() {
        return keyId.isBlank() ? null : keyId;
    }

    @Override
    public GatewayChargeResult charge(GatewayChargeRequest request) {
        requireConfigured();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", toMinorUnits(request.amount()));
        body.put("currency", request.currency() == null ? "INR" : request.currency());
        body.put("receipt", request.reference());
        Map<String, Object> notes = new LinkedHashMap<>();
        if (request.description() != null) {
            notes.put("description", request.description());
        }
        if (request.customerEmail() != null) {
            notes.put("email", request.customerEmail());
        }
        body.put("notes", notes);

        JsonNode order = send("POST", "/orders", body);
        String orderId = order.path("id").asText(null);
        if (orderId == null || orderId.isBlank()) {
            throw new PaymentGatewayException("Payment provider did not return an order id.");
        }
        log.info("[razorpay] Created order {} for receipt {} ({} {})",
                orderId, request.reference(), body.get("amount"), body.get("currency"));
        return new GatewayChargeResult(orderId, PaymentStatus.PENDING, "Awaiting checkout");
    }

    @Override
    public GatewayChargeResult verify(GatewayVerifyRequest request) {
        requireConfigured();
        String orderId = request.providerReference();
        String paymentId = request.param("payment_id");
        String signature = request.param("signature");
        if (orderId == null || orderId.isBlank() || paymentId == null || paymentId.isBlank()
                || signature == null || signature.isBlank()) {
            return new GatewayChargeResult(orderId, PaymentStatus.FAILED, "Missing verification parameters");
        }

        String expected = hmacSha256Hex(orderId + "|" + paymentId, keySecret);
        boolean valid = MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        if (!valid) {
            log.warn("[razorpay] Signature mismatch for order {} / payment {}", orderId, paymentId);
            return new GatewayChargeResult(orderId, PaymentStatus.FAILED, "Signature verification failed");
        }
        // The signature proves the payment_id belongs to this order and was authorised by Razorpay.
        return new GatewayChargeResult(paymentId, PaymentStatus.SUCCESS, "Payment verified");
    }

    @Override
    public GatewayChargeResult refund(String providerReference, BigDecimal amount) {
        requireConfigured();
        if (providerReference == null || providerReference.isBlank()) {
            throw new PaymentGatewayException("Cannot refund a payment without a provider reference.");
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", toMinorUnits(amount));
        JsonNode refund = send("POST", "/payments/" + providerReference + "/refund", body);
        String refundId = refund.path("id").asText(providerReference);
        log.info("[razorpay] Created refund {} for payment {}", refundId, providerReference);
        return new GatewayChargeResult(refundId, PaymentStatus.REFUNDED, "Refund created");
    }

    // --------------------------------------------------------------------

    private void requireConfigured() {
        if (keyId.isBlank() || keySecret.isBlank()) {
            throw new PaymentGatewayException(
                    "Razorpay is selected but not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }
    }

    /** Razorpay expects amounts as an integer in the currency's minor unit (e.g. paise for INR). */
    private static long toMinorUnits(BigDecimal amount) {
        BigDecimal value = amount == null ? BigDecimal.ZERO : amount;
        return value.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private JsonNode send(String method, String path, Map<String, Object> body) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(body);
        } catch (Exception ex) {
            throw new PaymentGatewayException("Could not build the payment request.", ex);
        }
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", basicAuthHeader())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                .build();
        HttpResponse<String> response;
        try {
            response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (java.io.IOException ex) {
            throw new PaymentGatewayException("Could not reach the payment provider. Please try again.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new PaymentGatewayException("Payment request was interrupted. Please try again.", ex);
        }

        JsonNode node;
        try {
            node = objectMapper.readTree(response.body());
        } catch (Exception ex) {
            throw new PaymentGatewayException("Payment provider returned an unreadable response.", ex);
        }
        if (response.statusCode() / 100 != 2) {
            String description = node.path("error").path("description").asText("");
            log.warn("[razorpay] {} {} -> HTTP {} ({})", method, path, response.statusCode(), description);
            throw new PaymentGatewayException(description.isBlank()
                    ? "The payment provider rejected the request."
                    : description);
        }
        return node;
    }

    private String basicAuthHeader() {
        String token = Base64.getEncoder()
                .encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));
        return "Basic " + token;
    }

    private static String hmacSha256Hex(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(raw.length * 2);
            for (byte b : raw) {
                hex.append(Character.forDigit((b >> 4) & 0xF, 16));
                hex.append(Character.forDigit(b & 0xF, 16));
            }
            return hex.toString();
        } catch (GeneralSecurityException ex) {
            throw new PaymentGatewayException("Unable to compute the payment signature.", ex);
        }
    }
}
