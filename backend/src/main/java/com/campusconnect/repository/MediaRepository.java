package com.campusconnect.repository;

import com.campusconnect.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByEventId(Long eventId);

    List<Media> findByClubId(Long clubId);

    List<Media> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<Media> findByClubIdOrderByCreatedAtDesc(Long clubId);
}
