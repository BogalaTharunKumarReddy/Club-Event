package com.campusconnect.dto.response;

/**
 * Result of an authentication attempt.
 *
 * <p>Two shapes flow through the same record:
 * <ul>
 *   <li><b>Completed login</b> — {@code twoFactorRequired = false}, tokens populated,
 *       {@code challengeToken = null}.</li>
 *   <li><b>2FA challenge</b> — {@code twoFactorRequired = true}, tokens {@code null},
 *       {@code challengeToken} carries the opaque handle the client echoes back with the
 *       emailed OTP code. The user id is never exposed during the challenge.</li>
 * </ul>
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserResponse user,
        boolean twoFactorRequired,
        String challengeToken
) {

    /** Completed login carrying issued tokens. */
    public static AuthResponse tokens(String accessToken, String refreshToken, long expiresIn, UserResponse user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, user, false, null);
    }

    /** Password step succeeded; an OTP has been emailed and must be verified to finish signing in. */
    public static AuthResponse challenge(String challengeToken) {
        return new AuthResponse(null, null, null, 0, null, true, challengeToken);
    }
}
