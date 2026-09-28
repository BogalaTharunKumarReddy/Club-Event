package com.campusconnect.service.whatsapp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Default WhatsApp provider used when no real gateway is configured ({@code app.whatsapp.provider=log},
 * the out-of-the-box default). It holds no credentials and contacts no external service, so the app
 * is fully runnable offline — mirroring how {@code MockPaymentGateway} keeps payments working without
 * a real provider. Messages are logged instead of sent, which also keeps ticket contents visible in
 * development. Activate real delivery by adding a configured provider and setting
 * {@code app.whatsapp.provider} to its name (e.g. {@code twilio}).
 */
@Component
@Slf4j
public class LoggingWhatsAppService implements WhatsAppService {

    @Override
    public String provider() {
        return "log";
    }

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public void sendText(String toPhone, String message) {
        log.info("[WhatsApp disabled] To: {} | Message:\n{}",
                toPhone == null || toPhone.isBlank() ? "(no phone on profile)" : toPhone, message);
    }
}
