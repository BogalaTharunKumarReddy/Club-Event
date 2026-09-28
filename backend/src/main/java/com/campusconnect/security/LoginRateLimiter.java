package com.campusconnect.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Dependency-free, in-memory sliding-window rate limiter for authentication
 * endpoints. Keyed by a caller-supplied string (typically client IP + ":" +
 * email) so a single attacker cannot lock out an unrelated account by guessing
 * its password from a different address.
 *
 * <p>Deliberately process-local — no Redis/bucket4j dependency. In a horizontally
 * scaled deployment each instance keeps its own counters; that is an acceptable
 * "defence in depth" trade-off for brute-force slowing (fronting infra / a WAF
 * should provide the authoritative global limit). A background sweep evicts
 * stale buckets so memory stays bounded under a spray of distinct keys.
 */
@Component
public class LoginRateLimiter {

    private final int maxAttempts;
    private final Duration window;
    private final Duration lockout;

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public LoginRateLimiter(
            @Value("${app.security.login.max-attempts:5}") int maxAttempts,
            @Value("${app.security.login.window-seconds:900}") long windowSeconds,
            @Value("${app.security.login.lockout-seconds:900}") long lockoutSeconds) {
        this.maxAttempts = Math.max(1, maxAttempts);
        this.window = Duration.ofSeconds(Math.max(1, windowSeconds));
        this.lockout = Duration.ofSeconds(Math.max(1, lockoutSeconds));
    }

    /**
     * @return the number of seconds the caller must wait, or 0 when the key is
     *         currently allowed to attempt a login.
     */
    public long retryAfterSeconds(String key) {
        Attempt a = attempts.get(key);
        if (a == null) {
            return 0;
        }
        Instant now = Instant.now();
        synchronized (a) {
            if (a.lockedUntil != null) {
                if (now.isBefore(a.lockedUntil)) {
                    return secondsUntil(now, a.lockedUntil);
                }
                // Lockout elapsed — reset the bucket.
                a.reset(now);
            }
            return 0;
        }
    }

    /** Records a failed attempt; trips a lockout once {@code maxAttempts} is reached in the window. */
    public void recordFailure(String key) {
        Instant now = Instant.now();
        Attempt a = attempts.computeIfAbsent(key, k -> new Attempt(now));
        synchronized (a) {
            // Slide the window: forget failures older than the window length.
            if (a.windowStart == null || Duration.between(a.windowStart, now).compareTo(window) > 0) {
                a.reset(now);
            }
            int count = a.count.incrementAndGet();
            if (count >= maxAttempts) {
                a.lockedUntil = now.plus(lockout);
            }
        }
    }

    /** Clears any recorded failures for the key after a successful login. */
    public void reset(String key) {
        attempts.remove(key);
    }

    private static long secondsUntil(Instant now, Instant future) {
        long secs = Duration.between(now, future).getSeconds();
        return Math.max(1, secs);
    }

    /** Evicts buckets whose window has fully elapsed and that are not locked, keeping the map bounded. */
    @Scheduled(fixedDelayString = "${app.security.login.sweep-ms:600000}")
    public void sweep() {
        Instant now = Instant.now();
        attempts.forEach((key, a) -> {
            synchronized (a) {
                boolean windowExpired = a.windowStart == null
                        || Duration.between(a.windowStart, now).compareTo(window) > 0;
                boolean notLocked = a.lockedUntil == null || now.isAfter(a.lockedUntil);
                if (windowExpired && notLocked) {
                    attempts.remove(key, a);
                }
            }
        });
    }

    private static final class Attempt {
        private final AtomicInteger count = new AtomicInteger(0);
        private Instant windowStart;
        private Instant lockedUntil;

        private Attempt(Instant start) {
            this.windowStart = start;
        }

        private void reset(Instant start) {
            count.set(0);
            windowStart = start;
            lockedUntil = null;
        }
    }
}
