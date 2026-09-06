package com.campusconnect.controller;

import com.campusconnect.common.ApiResponse;
import com.campusconnect.dto.response.UploadResponse;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.service.storage.LocalStorageService;
import com.campusconnect.service.storage.StoredFile;
import com.campusconnect.service.storage.StorageResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;

import java.time.Duration;
import java.util.Set;

/**
 * Upload endpoint (any authenticated user) plus a public read endpoint used by the local storage
 * backend. Uploads are validated against an allow-list of content types and routed to whichever
 * {@link StorageService} is active; the returned URL is what the client persists on an entity.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "Upload images/documents and serve locally-stored objects")
public class FileController {

    /** Content types accepted for upload. SVG is deliberately excluded (stored-XSS risk). */
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf");

    private final StorageResolver storageResolver;
    // Always present; only meaningful for the local backend (S3 objects are served by S3 itself).
    private final LocalStorageService localStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Upload an image or PDF and receive its resolvable URL")
    public ApiResponse<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was provided.");
        }
        String contentType = file.getContentType() == null
                ? "application/octet-stream"
                : file.getContentType().toLowerCase();
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException(
                    "Unsupported file type '" + contentType + "'. Allowed: PNG, JPEG, GIF, WEBP, PDF.");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception e) {
            throw new BadRequestException("Could not read the uploaded file.");
        }
        StoredFile stored = storageResolver.resolve()
                .store(folder, file.getOriginalFilename(), contentType, bytes);
        UploadResponse body = new UploadResponse(
                stored.key(), stored.url(), stored.contentType(), stored.size(),
                StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename()));
        return ApiResponse.success("File uploaded", body);
    }

    @GetMapping("/**")
    @Operation(summary = "Serve a locally-stored file by its key (public)")
    public ResponseEntity<byte[]> serve(HttpServletRequest request) {
        String key = extractKey(request);
        if (!StringUtils.hasText(key)) {
            return ResponseEntity.notFound().build();
        }
        return localStorageService.load(key)
                .map(bytes -> ResponseEntity.ok()
                        .contentType(contentTypeFor(key))
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                        .body(bytes))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Pull the portion of the path that follows {@code /api/files/}. */
    private String extractKey(HttpServletRequest request) {
        String full = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String pattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        if (full == null || pattern == null) {
            return null;
        }
        return new AntPathMatcher().extractPathWithinPattern(pattern, full);
    }

    private MediaType contentTypeFor(String key) {
        String ext = StringUtils.getFilenameExtension(key);
        if (ext == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        return switch (ext.toLowerCase()) {
            case "png" -> MediaType.IMAGE_PNG;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "webp" -> MediaType.parseMediaType("image/webp");
            case "pdf" -> MediaType.APPLICATION_PDF;
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}
