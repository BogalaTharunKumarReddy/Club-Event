package com.campusconnect.service;

/** Abstraction over outbound email so the rest of the app never touches JavaMailSender directly. */
public interface EmailService {

    /** Sends (or logs, when mail is disabled) a plain-text email. Never throws to callers. */
    void send(String to, String subject, String body);

    /**
     * Sends a plain-text email with a single binary attachment (e.g. a certificate PDF).
     * When mail is disabled this logs a placeholder instead. Never throws to callers.
     *
     * @param attachmentName file name shown to the recipient (e.g. {@code certificate.pdf})
     * @param attachment     the file bytes; if null or empty a plain email is sent
     * @param contentType    MIME type of the attachment (e.g. {@code application/pdf})
     */
    void sendWithAttachment(String to, String subject, String body,
                            String attachmentName, byte[] attachment, String contentType);
}
