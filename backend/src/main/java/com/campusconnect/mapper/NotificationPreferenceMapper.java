package com.campusconnect.mapper;

import com.campusconnect.dto.response.NotificationPreferenceResponse;
import com.campusconnect.entity.NotificationPreference;

public final class NotificationPreferenceMapper {

    private NotificationPreferenceMapper() {
    }

    public static NotificationPreferenceResponse toResponse(NotificationPreference preference) {
        if (preference == null) {
            return null;
        }
        return new NotificationPreferenceResponse(
                preference.isEmailEnabled(),
                preference.isEmailOnEvents(),
                preference.isEmailOnAnnouncements(),
                preference.isEmailOnCertificates(),
                preference.isEmailOnPayments(),
                preference.isEmailOnGeneral()
        );
    }
}
