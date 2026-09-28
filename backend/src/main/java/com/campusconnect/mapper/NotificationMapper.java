package com.campusconnect.mapper;

import com.campusconnect.dto.response.NotificationResponse;
import com.campusconnect.entity.Notification;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getLink(),
                notification.getCreatedAt()
        );
    }
}
