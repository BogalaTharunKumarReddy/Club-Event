package com.campusconnect.mapper;

import com.campusconnect.dto.request.CertificateTemplateRequest;
import com.campusconnect.dto.response.CertificateTemplateResponse;
import com.campusconnect.entity.CertificateTemplate;
import com.campusconnect.entity.Event;

/**
 * Maps between {@link CertificateTemplate} entities and their DTOs.
 *
 * <p>{@link #apply(CertificateTemplateRequest, CertificateTemplate)} coalesces the request's
 * wrapper-typed fields onto an entity, leaving any omitted field at its current (or default)
 * value — so the same method serves both create and partial update.
 */
public final class CertificateTemplateMapper {

    private CertificateTemplateMapper() {
    }

    public static CertificateTemplateResponse toResponse(CertificateTemplate t) {
        if (t == null) {
            return null;
        }
        Event event = t.getEvent();
        return new CertificateTemplateResponse(
                t.getId(),
                t.getName(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                t.getBackgroundImageUrl(),
                t.getTitleText(),
                t.getPresentedToText(),
                t.getBodyText(),
                t.isShowTitle(),
                t.isShowPresentedTo(),
                t.isShowBody(),
                t.isShowEvent(),
                t.isShowDate(),
                t.isShowQr(),
                t.getTitleY(),
                t.getPresentedToY(),
                t.getNameY(),
                t.getBodyY(),
                t.getEventY(),
                t.getDateY(),
                t.getQrY(),
                t.getTitleFontSize(),
                t.getNameFontSize(),
                t.getBodyFontSize(),
                t.getEventFontSize(),
                t.getTitleColor(),
                t.getNameColor(),
                t.getBodyColor(),
                t.isRequirePayment(),
                t.isAutoIssueOnComplete(),
                t.getAutoIssueScope(),
                t.getAutoIssueType(),
                t.getUpdatedAt()
        );
    }

    /** Applies a request onto an entity, coalescing missing (null) fields to the entity's value. */
    public static void apply(CertificateTemplateRequest r, CertificateTemplate t) {
        t.setName(r.name() != null ? r.name().trim() : t.getName());
        t.setBackgroundImageUrl(blankToNull(r.backgroundImageUrl()));

        if (r.titleText() != null) t.setTitleText(blankToNull(r.titleText()));
        if (r.presentedToText() != null) t.setPresentedToText(r.presentedToText());
        if (r.bodyText() != null) t.setBodyText(r.bodyText());

        if (r.showTitle() != null) t.setShowTitle(r.showTitle());
        if (r.showPresentedTo() != null) t.setShowPresentedTo(r.showPresentedTo());
        if (r.showBody() != null) t.setShowBody(r.showBody());
        if (r.showEvent() != null) t.setShowEvent(r.showEvent());
        if (r.showDate() != null) t.setShowDate(r.showDate());
        if (r.showQr() != null) t.setShowQr(r.showQr());

        if (r.titleY() != null) t.setTitleY(r.titleY());
        if (r.presentedToY() != null) t.setPresentedToY(r.presentedToY());
        if (r.nameY() != null) t.setNameY(r.nameY());
        if (r.bodyY() != null) t.setBodyY(r.bodyY());
        if (r.eventY() != null) t.setEventY(r.eventY());
        if (r.dateY() != null) t.setDateY(r.dateY());
        if (r.qrY() != null) t.setQrY(r.qrY());

        if (r.titleFontSize() != null) t.setTitleFontSize(r.titleFontSize());
        if (r.nameFontSize() != null) t.setNameFontSize(r.nameFontSize());
        if (r.bodyFontSize() != null) t.setBodyFontSize(r.bodyFontSize());
        if (r.eventFontSize() != null) t.setEventFontSize(r.eventFontSize());

        if (r.titleColor() != null) t.setTitleColor(r.titleColor());
        if (r.nameColor() != null) t.setNameColor(r.nameColor());
        if (r.bodyColor() != null) t.setBodyColor(r.bodyColor());

        if (r.requirePayment() != null) t.setRequirePayment(r.requirePayment());
        if (r.autoIssueOnComplete() != null) t.setAutoIssueOnComplete(r.autoIssueOnComplete());
        if (r.autoIssueScope() != null) t.setAutoIssueScope(r.autoIssueScope());
        if (r.autoIssueType() != null) t.setAutoIssueType(r.autoIssueType());
    }

    private static String blankToNull(String s) {
        if (s == null) {
            return null;
        }
        String trimmed = s.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
