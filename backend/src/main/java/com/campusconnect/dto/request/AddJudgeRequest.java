package com.campusconnect.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddJudgeRequest(
        @NotBlank(message = "Judge email is required")
        @Email(message = "A valid email is required")
        @Size(max = 160, message = "Email must be at most 160 characters")
        String email
) {
}
