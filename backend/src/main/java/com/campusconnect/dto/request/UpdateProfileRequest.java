package com.campusconnect.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 120)
        String fullName,

        @Size(max = 120)
        String department,

        @Size(max = 20)
        String phone,

        @Size(max = 2000)
        String bio,

        String profilePhotoUrl
) {
}
