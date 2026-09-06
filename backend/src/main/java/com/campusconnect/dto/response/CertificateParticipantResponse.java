package com.campusconnect.dto.response;

/**
 * A participant of a specific event who is eligible to receive a certificate, returned when a
 * coordinator opens the participant picker before a targeted bulk generation. The list is always
 * scoped to the one event — internal user ids are only ever exposed here for users who hold an
 * active registration (or attendance) for that event, never the whole user table.
 *
 * @param userId        internal id, used only to target the subsequent generate call
 * @param fullName      participant display name
 * @param email         participant email (shown so coordinators can disambiguate similarly-named participants)
 * @param attended      whether the participant has a recorded attendance for the event
 * @param paid          whether the participant has a successful payment (relevant only on paid events)
 * @param alreadyIssued whether the participant already holds a certificate of the selected type
 */
public record CertificateParticipantResponse(
        Long userId,
        String fullName,
        String email,
        boolean attended,
        boolean paid,
        boolean alreadyIssued
) {
}
