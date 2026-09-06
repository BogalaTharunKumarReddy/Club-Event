package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.CertificateRecipientScope;
import com.campusconnect.entity.enums.CertificateType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Upsert payload for a certificate template (event-bound or library).
 *
 * <p>Wrapper types are used throughout so the client may omit any field; the service coalesces
 * missing values to the entity defaults. Positions are normalized fractions of page height
 * (0 = top, 1 = bottom); colours are {@code #RRGGBB}.
 */
public record CertificateTemplateRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2048) String backgroundImageUrl,

        @Size(max = 180) String titleText,
        @Size(max = 160) String presentedToText,
        @Size(max = 200) String bodyText,

        Boolean showTitle,
        Boolean showPresentedTo,
        Boolean showBody,
        Boolean showEvent,
        Boolean showDate,
        Boolean showQr,

        @DecimalMin("0.0") @DecimalMax("1.0") Double titleY,
        @DecimalMin("0.0") @DecimalMax("1.0") Double presentedToY,
        @DecimalMin("0.0") @DecimalMax("1.0") Double nameY,
        @DecimalMin("0.0") @DecimalMax("1.0") Double bodyY,
        @DecimalMin("0.0") @DecimalMax("1.0") Double eventY,
        @DecimalMin("0.0") @DecimalMax("1.0") Double dateY,
        @DecimalMin("0.0") @DecimalMax("1.0") Double qrY,

        @Min(6) @Max(120) Integer titleFontSize,
        @Min(6) @Max(120) Integer nameFontSize,
        @Min(6) @Max(120) Integer bodyFontSize,
        @Min(6) @Max(120) Integer eventFontSize,

        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Colour must be a #RRGGBB hex value") String titleColor,
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Colour must be a #RRGGBB hex value") String nameColor,
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Colour must be a #RRGGBB hex value") String bodyColor,

        Boolean requirePayment,
        Boolean autoIssueOnComplete,
        CertificateRecipientScope autoIssueScope,
        CertificateType autoIssueType
) {
}
