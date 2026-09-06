package com.campusconnect.repository;

import com.campusconnect.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByUserId(Long userId);

    Optional<NotificationPreference> findByUnsubscribeToken(String unsubscribeToken);
}
