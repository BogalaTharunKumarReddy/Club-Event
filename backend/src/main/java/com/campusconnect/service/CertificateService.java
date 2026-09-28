package com.campusconnect.service;

import com.campusconnect.dto.request.CertificateBulkIssueRequest;
import com.campusconnect.dto.request.CertificateIssueRequest;
import com.campusconnect.dto.request.CertificateTemplateRequest;
import com.campusconnect.dto.response.CertificateBatchResponse;
import com.campusconnect.dto.response.CertificateParticipantResponse;
import com.campusconnect.dto.response.CertificateResponse;
import com.campusconnect.dto.response.CertificateTemplateResponse;
import com.campusconnect.dto.response.CertificateVerificationResponse;
import com.campusconnect.entity.enums.CertificateRecipientScope;
import com.campusconnect.entity.enums.CertificateType;

import java.util.List;

public interface CertificateService {

    /** Issue a certificate to a participant. The acting user must be a coordinator of the event's club. */
    CertificateResponse issue(Long actingUserId, CertificateIssueRequest request);

    List<CertificateResponse> myCertificates(Long userId);

    List<CertificateResponse> eventCertificates(Long actingUserId, Long eventId);

    /** Public verification by opaque code. Returns {@code valid=false} when unknown. */
    CertificateVerificationResponse verify(String certificateCode);

    /**
     * Revoke (soft-delete) a certificate. Allowed for a platform admin or a coordinator of the
     * event's owning club. Returns the updated certificate.
     */
    CertificateResponse revoke(Long actingUserId, Long certificateId);

    /** Render the certificate as a downloadable PDF. Owner or event coordinator only. */
    byte[] renderPdf(Long actingUserId, Long certificateId);

    /**
     * Render a certificate as a PDF from its public verification code — no authentication required,
     * the opaque code is the capability. Fails if the code is unknown or the certificate is revoked.
     */
    byte[] renderVerifiedPdf(String certificateCode);

    // ---- templates (event-bound) ----

    /** The design configured for an event, or {@code null} if none has been set. Coordinator/admin only. */
    CertificateTemplateResponse getEventTemplate(Long actingUserId, Long eventId);

    /** Create or update the single certificate design bound to an event. Coordinator/admin only. */
    CertificateTemplateResponse saveEventTemplate(Long actingUserId, Long eventId, CertificateTemplateRequest request);

    // ---- bulk issuing ----

    /**
     * Issue certificates in bulk to every eligible participant of an event, chosen by {@code scope}
     * (all registered, or only those who attended). Participants who already hold a certificate of the
     * given type are skipped; when the event's template gates on payment, unpaid participants are skipped
     * with a reason. Coordinator/admin only.
     */
    CertificateBatchResponse generateForEvent(Long actingUserId, Long eventId,
                                              CertificateRecipientScope scope, CertificateType type);

    /**
     * List the participants of an event who are eligible to receive a certificate, for the
     * participant picker. Scoped strictly to the event (registered participants, or only those who
     * attended when {@code scope=ATTENDED}); each entry is flagged with attendance, payment and
     * whether the participant already holds a certificate of {@code type}. Coordinator/admin only.
     */
    List<CertificateParticipantResponse> eligibleParticipants(Long actingUserId, Long eventId,
                                                              CertificateRecipientScope scope,
                                                              CertificateType type);

    /**
     * Issue certificates to an explicitly-chosen set of participants (from the picker). Every id is
     * validated to be an actual participant of the event before issuing; ids that are not, that
     * already hold a certificate of the type, or that fail the payment gate are skipped with a
     * reason. Coordinator/admin only.
     */
    CertificateBatchResponse generateForParticipants(Long actingUserId, Long eventId,
                                                     CertificateBulkIssueRequest request);

    /**
     * System-initiated auto-issue triggered when an event is marked COMPLETED. No-op unless the event's
     * template opts in ({@code autoIssueOnComplete}). Never throws — failures are logged so they can't
     * roll back the status change that triggered them.
     */
    void autoIssueForCompletedEvent(Long eventId);

    // ---- delivery ----

    /** A ZIP archive of every (non-revoked) issued certificate PDF for an event. Coordinator/admin only. */
    byte[] renderEventZip(Long actingUserId, Long eventId);

    /**
     * Email every participant their certificate PDF as an attachment. Returns the number of messages
     * dispatched (delivery itself is asynchronous). Coordinator/admin only.
     */
    int emailEventCertificates(Long actingUserId, Long eventId);

    // ---- admin template library ----

    List<CertificateTemplateResponse> listLibraryTemplates(Long actingUserId);

    CertificateTemplateResponse createLibraryTemplate(Long actingUserId, CertificateTemplateRequest request);

    CertificateTemplateResponse updateLibraryTemplate(Long actingUserId, Long templateId,
                                                      CertificateTemplateRequest request);

    void deleteLibraryTemplate(Long actingUserId, Long templateId);

    /** Copy a library template's design onto an event's template (creating it if needed). */
    CertificateTemplateResponse applyLibraryTemplate(Long actingUserId, Long eventId, Long templateId);
}
