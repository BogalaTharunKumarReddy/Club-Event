package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.EventMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 180)
        String title,

        @Size(max = 10000)
        String description,

        @Size(max = 80)
        String category,

        String bannerUrl,

        @NotNull(message = "Mode is required")
        EventMode mode,

        @Size(max = 200)
        String venue,

        String onlineUrl,

        @NotNull(message = "Start date/time is required")
        LocalDateTime startDateTime,

        @NotNull(message = "End date/time is required")
        LocalDateTime endDateTime,

        LocalDateTime registrationDeadline,

        @Min(value = 0, message = "Capacity cannot be negative")
        Integer capacity,

        @Size(max = 10000)
        String rules,

        @Size(max = 10000)
        String instructions,

        boolean paidEvent,

        @DecimalMin(value = "0.0", message = "Fee cannot be negative")
        BigDecimal fee,

        boolean teamEvent,

        @Min(value = 1, message = "Minimum team size must be at least 1")
        Integer minTeamSize,

        @Min(value = 1, message = "Maximum team size must be at least 1")
        Integer maxTeamSize,

        boolean featured,

        @NotNull(message = "Club id is required")
        Long clubId
) {
}
