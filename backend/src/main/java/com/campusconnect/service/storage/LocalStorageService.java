package com.campusconnect.service.storage;

import com.campusconnect.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Default storage backend: writes objects under a configurable base directory and serves them back
 * through {@code GET /api/files/**} (see {@code FileController}). Holds no credentials, so the app
 * is fully runnable out of the box with no cloud account.
 *
 * <p>Keys are of the form {@code folder/yyyy/MM/uuid.ext}; the public URL is
 * {@code {app.storage.local.public-base-url}/{key}} (relative by default, so it works unchanged in
 * both single-host and split-domain deployments).
 */
@Component
@Slf4j
public class LocalStorageService implements StorageService {

    private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern("yyyy/MM");

    private final Path baseDir;
    private final String publicBaseUrl;

    public LocalStorageService(
            @Value("${app.storage.local.directory:./uploads}") String directory,
            @Value("${app.storage.local.public-base-url:/api/files}") String publicBaseUrl) {
        this.baseDir = Paths.get(directory).toAbsolutePath().normalize();
        // Trim a trailing slash so we can join with "/" unconditionally.
        this.publicBaseUrl = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(baseDir);
            log.info("Local file storage rooted at {} (served from {})", baseDir, publicBaseUrl);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create storage directory " + baseDir, e);
        }
    }

    @Override
    public String provider() {
        return "local";
    }

    @Override
    public StoredFile store(String folder, String originalName, String contentType, byte[] content) {
        String key = buildKey(folder, originalName);
        Path target = resolve(key);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, content);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store file " + key, e);
        }
        return new StoredFile(key, publicBaseUrl + "/" + key, contentType, content.length);
    }

    @Override
    public void delete(String key) {
        if (!StringUtils.hasText(key)) {
            return;
        }
        try {
            Files.deleteIfExists(resolve(key));
        } catch (IOException | BadRequestException e) {
            // Best-effort — a failed cleanup must never break the primary action.
            log.warn("Could not delete stored file '{}': {}", key, e.getMessage());
        }
    }

    /** Read a stored object for serving. Empty when the key does not resolve to a readable file. */
    public Optional<byte[]> load(String key) {
        try {
            Path path = resolve(key);
            if (!Files.isReadable(path) || Files.isDirectory(path)) {
                return Optional.empty();
            }
            return Optional.of(Files.readAllBytes(path));
        } catch (IOException | BadRequestException e) {
            return Optional.empty();
        }
    }

    /** Resolve a key to an absolute path, rejecting any traversal outside the base directory. */
    private Path resolve(String key) {
        Path resolved = baseDir.resolve(key).normalize();
        if (!resolved.startsWith(baseDir)) {
            throw new BadRequestException("Invalid file path");
        }
        return resolved;
    }

    private String buildKey(String folder, String originalName) {
        String safeFolder = sanitizeFolder(folder);
        String ext = extension(originalName);
        String name = UUID.randomUUID().toString().replace("-", "") + ext;
        String datePart = LocalDate.now().format(MONTH);
        return (safeFolder.isEmpty() ? "" : safeFolder + "/") + datePart + "/" + name;
    }

    /** Keep only a single safe path segment: lower-case alphanumerics, dash, underscore. */
    private String sanitizeFolder(String folder) {
        if (!StringUtils.hasText(folder)) {
            return "misc";
        }
        String cleaned = folder.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_-]", "");
        return cleaned.isEmpty() ? "misc" : cleaned;
    }

    private String extension(String originalName) {
        String ext = StringUtils.getFilenameExtension(originalName);
        if (!StringUtils.hasText(ext)) {
            return "";
        }
        // Guard against absurdly long or unsafe extensions.
        String cleaned = ext.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return cleaned.isEmpty() ? "" : "." + cleaned.substring(0, Math.min(cleaned.length(), 8));
    }
}
