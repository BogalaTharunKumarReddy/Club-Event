package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
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
import com.campusconnect.security.UserPrincipal;
import com.campusconnect.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates", description = "Issue, download and publicly verify participation certificates")
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Issue a certificate to a participant (club coordinator only)")
    public ApiResponse<CertificateResponse> issue(@AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestBody CertificateIssueRequest request) {
        return ApiResponse.success("Certificate issued",
                certificateService.issue(principal.getId(), request));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List my certificates")
    public ApiResponse<List<CertificateResponse>> myCertificates(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(certificateService.myCertificates(principal.getId()));
    }

    @GetMapping("/event/{eventId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List certificates issued for an event (admin or club coordinator)")
    public ApiResponse<List<CertificateResponse>> eventCertificates(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId) {
        return ApiResponse.success(certificateService.eventCertificates(principal.getId(), eventId));
    }

    @GetMapping("/{id}/download")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Download a certificate as a PDF (owner or event coordinator)")
    public ResponseEntity<byte[]> download(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long id) {
        byte[] pdf = certificateService.renderPdf(principal.getId(), id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/verify/{code}")
    @Operation(summary = "Publicly verify a certificate by its code")
    public ApiResponse<CertificateVerificationResponse> verify(@PathVariable String code) {
        return ApiResponse.success(certificateService.verify(code));
    }

    @GetMapping("/verify/{code}/download")
    @Operation(summary = "Publicly download a verified certificate as a PDF by its code")
    public ResponseEntity<byte[]> downloadByCode(@PathVariable String code) {
        byte[] pdf = certificateService.renderVerifiedPdf(code);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate-" + code + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Revoke a certificate (platform admin or the event's club coordinator)")
    public ApiResponse<CertificateResponse> revoke(@AuthenticationPrincipal UserPrincipal principal,
                                                   @PathVariable Long id) {
        return ApiResponse.success("Certificate revoked", certificateService.revoke(principal.getId(), id));
    }

    // ---- event templates ----

    @GetMapping("/event/{eventId}/template")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get the certificate design configured for an event (admin or coordinator)")
    public ApiResponse<CertificateTemplateResponse> getEventTemplate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId) {
        return ApiResponse.success(certificateService.getEventTemplate(principal.getId(), eventId));
    }

    @PutMapping("/event/{eventId}/template")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create or update an event's certificate design (admin or coordinator)")
    public ApiResponse<CertificateTemplateResponse> saveEventTemplate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId,
            @Valid @RequestBody CertificateTemplateRequest request) {
        return ApiResponse.success("Template saved",
                certificateService.saveEventTemplate(principal.getId(), eventId, request));
    }

    @PostMapping("/event/{eventId}/apply-template/{templateId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Apply a reusable library template to an event (admin or coordinator)")
    public ApiResponse<CertificateTemplateResponse> applyLibraryTemplate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId,
            @PathVariable Long templateId) {
        return ApiResponse.success("Template applied",
                certificateService.applyLibraryTemplate(principal.getId(), eventId, templateId));
    }

    // ---- bulk issuing & delivery ----

    @PostMapping("/event/{eventId}/generate")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Bulk-issue certificates to an event's participants (admin or coordinator)")
    public ApiResponse<CertificateBatchResponse> generate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId,
            @RequestParam(required = false) CertificateRecipientScope scope,
            @RequestParam(required = false) CertificateType type) {
        CertificateBatchResponse result = certificateService.generateForEvent(principal.getId(), eventId, scope, type);
        return ApiResponse.success(
                "Issued " + result.issued() + " certificate(s), skipped " + result.skipped(), result);
    }

    @GetMapping("/event/{eventId}/participants")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List an event's participants eligible for a certificate, for the picker (admin or coordinator)")
    public ApiResponse<List<CertificateParticipantResponse>> eligibleParticipants(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId,
            @RequestParam(required = false) CertificateRecipientScope scope,
            @RequestParam(required = false) CertificateType type) {
        return ApiResponse.success(
                certificateService.eligibleParticipants(principal.getId(), eventId, scope, type));
    }

    @PostMapping("/event/{eventId}/generate-selected")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Issue certificates to explicitly-selected participants (admin or coordinator)")
    public ApiResponse<CertificateBatchResponse> generateSelected(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId,
            @Valid @RequestBody CertificateBulkIssueRequest request) {
        CertificateBatchResponse result =
                certificateService.generateForParticipants(principal.getId(), eventId, request);
        return ApiResponse.success(
                "Issued " + result.issued() + " certificate(s), skipped " + result.skipped(), result);
    }

    @GetMapping("/event/{eventId}/zip")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Download all issued certificates for an event as a ZIP (admin or coordinator)")
    public ResponseEntity<byte[]> downloadZip(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long eventId) {
        byte[] zip = certificateService.renderEventZip(principal.getId(), eventId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"certificates-event-" + eventId + ".zip\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zip);
    }

    @PostMapping("/event/{eventId}/email")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Email each participant their certificate PDF (admin or coordinator)")
    public ApiResponse<Integer> emailAll(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long eventId) {
        int dispatched = certificateService.emailEventCertificates(principal.getId(), eventId);
        return ApiResponse.success("Emailing " + dispatched + " certificate(s)", dispatched);
    }

    // ---- admin template library ----

    @GetMapping("/templates")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List reusable certificate templates (platform admin only)")
    public ApiResponse<List<CertificateTemplateResponse>> listLibrary(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(certificateService.listLibraryTemplates(principal.getId()));
    }

    @PostMapping("/templates")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a reusable certificate template (platform admin only)")
    public ApiResponse<CertificateTemplateResponse> createLibrary(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CertificateTemplateRequest request) {
        return ApiResponse.success("Template created",
                certificateService.createLibraryTemplate(principal.getId(), request));
    }

    @PutMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a reusable certificate template (platform admin only)")
    public ApiResponse<CertificateTemplateResponse> updateLibrary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long templateId,
            @Valid @RequestBody CertificateTemplateRequest request) {
        return ApiResponse.success("Template updated",
                certificateService.updateLibraryTemplate(principal.getId(), templateId, request));
    }

    @DeleteMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a reusable certificate template (platform admin only)")
    public ApiResponse<Void> deleteLibrary(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long templateId) {
        certificateService.deleteLibraryTemplate(principal.getId(), templateId);
        return ApiResponse.message("Template deleted");
    }
}
