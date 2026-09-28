package com.campusconnect.service.storage;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

/**
 * S3-compatible object-store backend, activated only when {@code app.storage.provider=s3}. Works
 * with AWS S3 and any S3-compatible service (MinIO, Cloudflare R2, DigitalOcean Spaces …) via an
 * optional endpoint override and path-style toggle.
 *
 * <p>All credentials come from the environment: when an explicit access/secret key pair is supplied
 * it is used, otherwise the AWS default provider chain (env vars, profiles, instance role) applies.
 * Nothing is ever hardcoded, and the bean is not even constructed unless S3 is the selected provider,
 * so the app boots without the AWS SDK being configured.
 */
@Component
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "s3")
@Slf4j
public class S3StorageService implements StorageService {

    private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern("yyyy/MM");

    private final String bucket;
    private final String region;
    private final String endpoint;
    private final String accessKey;
    private final String secretKey;
    private final boolean pathStyle;
    private final String publicBaseUrl;

    private S3Client client;

    public S3StorageService(
            @Value("${app.storage.s3.bucket:}") String bucket,
            @Value("${app.storage.s3.region:us-east-1}") String region,
            @Value("${app.storage.s3.endpoint:}") String endpoint,
            @Value("${app.storage.s3.access-key:}") String accessKey,
            @Value("${app.storage.s3.secret-key:}") String secretKey,
            @Value("${app.storage.s3.path-style:false}") boolean pathStyle,
            @Value("${app.storage.s3.public-base-url:}") String publicBaseUrl) {
        this.bucket = bucket;
        this.region = StringUtils.hasText(region) ? region : "us-east-1";
        this.endpoint = endpoint;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.pathStyle = pathStyle;
        this.publicBaseUrl = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;
    }

    @PostConstruct
    void init() {
        if (!StringUtils.hasText(bucket)) {
            throw new IllegalStateException(
                    "app.storage.provider=s3 requires app.storage.s3.bucket (set STORAGE_S3_BUCKET).");
        }
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(pathStyle).build());

        if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        if (StringUtils.hasText(endpoint)) {
            builder.endpointOverride(URI.create(endpoint));
        }
        this.client = builder.build();
        log.info("S3 file storage active — bucket='{}' region='{}' endpoint='{}'",
                bucket, region, StringUtils.hasText(endpoint) ? endpoint : "(aws default)");
    }

    @PreDestroy
    void close() {
        if (client != null) {
            client.close();
        }
    }

    @Override
    public String provider() {
        return "s3";
    }

    @Override
    public StoredFile store(String folder, String originalName, String contentType, byte[] content) {
        String key = buildKey(folder, originalName);
        client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(content));
        return new StoredFile(key, resolveUrl(key), contentType, content.length);
    }

    @Override
    public void delete(String key) {
        if (!StringUtils.hasText(key)) {
            return;
        }
        try {
            client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (RuntimeException e) {
            log.warn("Could not delete S3 object '{}': {}", key, e.getMessage());
        }
    }

    /** Prefer an explicit CDN/public base URL; otherwise derive a virtual-hosted-style S3 URL. */
    private String resolveUrl(String key) {
        if (StringUtils.hasText(publicBaseUrl)) {
            return publicBaseUrl + "/" + key;
        }
        if (StringUtils.hasText(endpoint)) {
            String base = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
            return pathStyle ? base + "/" + bucket + "/" + key : base + "/" + key;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    private String buildKey(String folder, String originalName) {
        String safeFolder = StringUtils.hasText(folder)
                ? folder.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_-]", "")
                : "misc";
        if (safeFolder.isEmpty()) {
            safeFolder = "misc";
        }
        String ext = StringUtils.getFilenameExtension(originalName);
        String suffix = StringUtils.hasText(ext)
                ? "." + ext.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "")
                : "";
        String name = UUID.randomUUID().toString().replace("-", "") + suffix;
        return safeFolder + "/" + LocalDate.now().format(MONTH) + "/" + name;
    }
}
