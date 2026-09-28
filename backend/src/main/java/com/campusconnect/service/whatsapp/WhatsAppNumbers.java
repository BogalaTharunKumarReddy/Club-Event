package com.campusconnect.service.whatsapp;

import java.util.Optional;

/**
 * Normalises loosely-formatted phone numbers into an E.164 address for WhatsApp
 * ({@code whatsapp:+<countrycode><number>}), which is the address format Twilio and the WhatsApp
 * Business API expect.
 *
 * <p>Kept as a tiny, dependency-free helper (no libphonenumber) so it is easy to reason about and
 * verify. It is deliberately conservative: if it cannot confidently produce an international number
 * it returns {@link Optional#empty()} rather than guessing and messaging the wrong person.
 */
final class WhatsAppNumbers {

    private WhatsAppNumbers() {
    }

    /**
     * Build a {@code whatsapp:+E164} address from a raw phone number.
     *
     * @param rawPhone           the number as stored on the user profile (may be null/blank)
     * @param defaultCountryCode digits-only fallback country code (e.g. {@code "91"}) applied when
     *                           the number has no leading {@code +}; blank disables the fallback
     * @return the {@code whatsapp:+…} address, or empty if a valid international number can't be formed
     */
    static Optional<String> toWhatsAppAddress(String rawPhone, String defaultCountryCode) {
        return toE164(rawPhone, defaultCountryCode).map(e164 -> "whatsapp:" + e164);
    }

    /** Build a bare {@code +E164} number, or empty when one can't be confidently derived. */
    static Optional<String> toE164(String rawPhone, String defaultCountryCode) {
        if (rawPhone == null) {
            return Optional.empty();
        }
        String trimmed = rawPhone.trim();
        if (trimmed.isEmpty()) {
            return Optional.empty();
        }

        boolean hasPlus = trimmed.startsWith("+");
        String digits = trimmed.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            return Optional.empty();
        }

        if (hasPlus) {
            // Already international; keep the country code the user supplied.
            return digits.length() >= 8 && digits.length() <= 15 ? Optional.of("+" + digits) : Optional.empty();
        }

        String cc = defaultCountryCode == null ? "" : defaultCountryCode.replaceAll("[^0-9]", "");
        if (cc.isEmpty()) {
            // No country code on the number and no configured default — can't safely internationalise.
            return Optional.empty();
        }
        // Drop a single leading trunk zero (common in local formats) before prefixing the country code.
        String national = digits.startsWith("0") ? digits.substring(1) : digits;
        String combined = cc + national;
        return combined.length() >= 8 && combined.length() <= 15 ? Optional.of("+" + combined) : Optional.empty();
    }
}
