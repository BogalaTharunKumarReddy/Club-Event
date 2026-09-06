package com.campusconnect.dto.response;

import com.campusconnect.entity.enums.CertificateRecipientScope;
import com.campusconnect.entity.enums.CertificateType;

import java.time.Instant;

/**
 * A certificate template. When {@code eventId} is null this is a reusable library template;
 * otherwise it is bound to that event.
 */
public record CertificateTemplateResponse(
        Long id,
        String name,
        Long eventId,
        String eventTitle,
        String backgroundImageUrl,

        String titleText,
        String presentedToText,
        String bodyText,

        boolean showTitle,
        boolean showPresentedTo,
        boolean showBody,
        boolean showEvent,
        boolean showDate,
        boolean showQr,

        double titleY,
        double presentedToY,
        double nameY,
        double bodyY,
        double eventY,
        double dateY,
        double qrY,

        int titleFontSize,
        int nameFontSize,
        int bodyFontSize,
        int eventFontSize,

        String titleColor,
        String nameColor,
        String bodyColor,

        boolean requirePayment,
        boolean autoIssueOnComplete,
        CertificateRecipientScope autoIssueScope,
        CertificateType autoIssueType,

        Instant updatedAt
) {
}
