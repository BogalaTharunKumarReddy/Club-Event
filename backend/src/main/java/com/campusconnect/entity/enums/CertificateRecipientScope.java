package com.campusconnect.entity.enums;

/**
 * Which participants a batch certificate generation targets.
 *
 * <ul>
 *   <li>{@link #REGISTERED} — everyone with an active (non-cancelled) registration.</li>
 *   <li>{@link #ATTENDED} — only participants who were checked in for the event.</li>
 * </ul>
 */
public enum CertificateRecipientScope {
    REGISTERED,
    ATTENDED
}
