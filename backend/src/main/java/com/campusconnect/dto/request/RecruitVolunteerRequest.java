package com.campusconnect.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Coordinator/admin action to directly recruit an existing user as a volunteer for an event.
 * The recruited volunteer is auto-approved.
 */
public record RecruitVolunteerRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @Size(max = 120) String role
) {
}
