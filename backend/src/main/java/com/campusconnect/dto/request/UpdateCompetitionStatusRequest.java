package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.CompetitionStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCompetitionStatusRequest(
        @NotNull CompetitionStatus status
) {
}
