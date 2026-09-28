package com.campusconnect.repository;

import com.campusconnect.entity.Announcement;
import com.campusconnect.entity.enums.AnnouncementScope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByClubIdOrderByPinnedDescCreatedAtDesc(Long clubId);

    List<Announcement> findByEventIdOrderByPinnedDescCreatedAtDesc(Long eventId);

    List<Announcement> findByScopeOrderByPinnedDescCreatedAtDesc(AnnouncementScope scope);

    List<Announcement> findAllByOrderByPinnedDescCreatedAtDesc();
}
