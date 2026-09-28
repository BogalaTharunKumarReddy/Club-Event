package com.campusconnect.service.whatsapp;

/**
 * Abstraction over WhatsApp messaging providers, mirroring the payment-gateway abstraction so a new
 * provider (Twilio, Meta Cloud API, …) can be added without touching business logic. To add one,
 * implement this interface as a Spring bean and set {@code app.whatsapp.provider} to its
 * {@link #provider()} name. Provider credentials must be read from environment variables inside the
 * implementation — never hardcoded or exposed to clients.
 *
 * <p>Implementations must be <strong>fail-soft</strong>: {@link #sendText} never throws. WhatsApp
 * delivery is a best-effort side effect of an already-completed action (e.g. a settled payment), so
 * a messaging outage must never roll back or break the primary flow.
 */
public interface WhatsAppService {

    /** Unique provider key, e.g. {@code "log"} (no-op default) or {@code "twilio"}. */
    String provider();

    /**
     * Whether this provider is actually configured and able to deliver messages. When {@code false}
     * (e.g. the logging default, or Twilio with blank credentials) callers can skip building a
     * message body, and {@link #sendText} degrades to a log line.
     */
    boolean isEnabled();

    /**
     * Send a plain-text WhatsApp message to a recipient phone number. The number may be supplied in
     * loose local form ({@code "+91 98765 43210"}, {@code "9876543210"}, …); implementations
     * normalise it to the provider's required address format. Never throws — on any failure it logs
     * and returns.
     *
     * @param toPhone  recipient phone number (raw, as stored on the user profile); may be null/blank
     * @param message  the message body to deliver
     */
    void sendText(String toPhone, String message);
}
