package com.campusconnect.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * A club coordinator (or admin) adding an existing user as a volunteer for a
 * club. Volunteers can only be created this way — there is no public self-apply
 * path — so the caller identifies the person by their account email.
 */
public record VolunteerAddRequest(
        @NotBlank @Email @Size(max = 200) String email,
        @Size(max = 500) String skills,
        @Size(max = 500) String availability
) {
}
