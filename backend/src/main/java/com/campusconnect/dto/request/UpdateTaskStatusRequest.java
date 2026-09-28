package com.campusconnect.dto.request;

import com.campusconnect.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

/** Update the completion state of a volunteer task. */
public record UpdateTaskStatusRequest(
        @NotNull TaskStatus status
) {
}
