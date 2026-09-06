package com.campusconnect.mapper;

import com.campusconnect.dto.response.FeedbackResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Feedback;
import com.campusconnect.entity.User;

public final class FeedbackMapper {

    private FeedbackMapper() {
    }

    public static FeedbackResponse toResponse(Feedback feedback) {
        if (feedback == null) {
            return null;
        }
        Event event = feedback.getEvent();
        User user = feedback.getUser();
        return new FeedbackResponse(
                feedback.getId(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                feedback.getRating(),
                feedback.getComment(),
                feedback.getSuggestion(),
                feedback.getCreatedAt()
        );
    }
}
