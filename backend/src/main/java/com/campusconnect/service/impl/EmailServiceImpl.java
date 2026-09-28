package com.campusconnect.service.impl;

import com.campusconnect.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public EmailServiceImpl(JavaMailSender mailSender,
                            @Value("${app.mail.enabled}") boolean enabled,
                            @Value("${app.mail.from}") String from) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
    }

    @Async
    @Override
    public void send(String to, String subject, String body) {
        if (!enabled) {
            // In development, mail is disabled: log so links (verification, reset) are still visible.
            log.info("[MAIL disabled] To: {} | Subject: {}\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }

    @Async
    @Override
    public void sendWithAttachment(String to, String subject, String body,
                                   String attachmentName, byte[] attachment, String contentType) {
        boolean hasAttachment = attachment != null && attachment.length > 0;
        if (!enabled) {
            log.info("[MAIL disabled] To: {} | Subject: {} | Attachment: {} ({} bytes)\n{}",
                    to, subject,
                    hasAttachment ? attachmentName : "none",
                    hasAttachment ? attachment.length : 0,
                    body);
            return;
        }
        if (!hasAttachment) {
            // Nothing to attach — fall back to a plain email rather than sending an empty part.
            send(to, subject, body);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);

            String safeName = StringUtils.hasText(attachmentName) ? attachmentName : "attachment";
            ByteArrayResource resource = new ByteArrayResource(attachment);
            if (StringUtils.hasText(contentType)) {
                helper.addAttachment(safeName, resource, contentType);
            } else {
                helper.addAttachment(safeName, resource);
            }

            mailSender.send(message);
            log.info("Email with attachment '{}' sent to {}", safeName, to);
        } catch (Exception ex) {
            log.error("Failed to send email with attachment to {}: {}", to, ex.getMessage());
        }
    }
}
