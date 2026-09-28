package com.campusconnect.dto.request;

import jakarta.validation.constraints.Size;

/** Completion notes a volunteer submits when finishing a task. */
public record VolunteerTaskCompleteRequest(
        @Size(max = 2000) String completionNotes
) {
}
