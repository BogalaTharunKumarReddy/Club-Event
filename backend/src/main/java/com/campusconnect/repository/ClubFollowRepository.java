package com.campusconnect.repository;

import com.campusconnect.entity.ClubFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ClubFollowRepository extends JpaRepository<ClubFollow, Long> {

    boolean existsByClubIdAndUserId(Long clubId, Long userId);

    Optional<ClubFollow> findByClubIdAndUserId(Long clubId, Long userId);

    long countByClubId(Long clubId);

    /** Everyone following a club — used to fan out "new event" notifications. */
    List<ClubFollow> findByClubId(Long clubId);

    /** A user's follows, newest first — backs the "clubs you follow" list. */
    List<ClubFollow> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** The set of club ids a user follows, for batch-flagging club listings without N+1 lookups. */
    @Query("select cf.club.id from ClubFollow cf where cf.user.id = :userId")
    Set<Long> findClubIdsByUserId(@Param("userId") Long userId);
}
