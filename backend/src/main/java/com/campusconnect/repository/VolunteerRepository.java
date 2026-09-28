package com.campusconnect.repository;

import com.campusconnect.entity.Volunteer;
<<<<<<< HEAD
import com.campusconnect.entity.enums.VolunteerStatus;
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

<<<<<<< HEAD
    /** A user's volunteer profiles across all clubs. */
    List<Volunteer> findByUserId(Long userId);

    Optional<Volunteer> findByUserIdAndClubId(Long userId, Long clubId);

    boolean existsByUserIdAndClubId(Long userId, Long clubId);

    /** Any active volunteer profile for the user — used to gate volunteer-only actions. */
    Optional<Volunteer> findFirstByUserIdAndStatus(Long userId, VolunteerStatus status);

    List<Volunteer> findByClubId(Long clubId);

    List<Volunteer> findByClubIdAndStatus(Long clubId, VolunteerStatus status);

    long countByClubIdAndStatus(Long clubId, VolunteerStatus status);
=======
    List<Volunteer> findByEventId(Long eventId);

    List<Volunteer> findByEventIdAndApprovedTrue(Long eventId);

    List<Volunteer> findByUserId(Long userId);

    Optional<Volunteer> findByEventIdAndUserId(Long eventId, Long userId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    long countByEventIdAndApprovedTrue(Long eventId);
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
}
