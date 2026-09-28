package com.campusconnect.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClubRequest(
        @NotBlank(message = "Club name is required")
        @Size(max = 140)
        String name,

        @Size(max = 5000)
        String description,

        @Size(max = 80)
        String category,

        String logoUrl,

        String coverImageUrl,

        @Email(message = "Contact email must be valid")
        @Size(max = 160)
        String contactEmail,

        @Size(max = 20)
        String contactPhone
) {
}
