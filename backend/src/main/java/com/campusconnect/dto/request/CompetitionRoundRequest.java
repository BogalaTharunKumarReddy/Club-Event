package com.campusconnect.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CompetitionRoundRequest(
        @NotBlank(message = "Round name is required")
        @Size(max = 140, message = "Round name must be at most 140 characters")
        String name,

        @NotNull(message = "Round number is required")
        @Min(value = 1, message = "Round number must be at least 1")
        Integer roundNumber,

        @Size(max = 5000, message = "Description must be at most 5000 characters")
        String description,

        @NotNull(message = "Maximum score is required")
        @Positive(message = "Maximum score must be greater than zero")
        Double maxScore,

        LocalDateTime scheduledAt
) {
}
