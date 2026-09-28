package com.campusconnect.repository;

import com.campusconnect.entity.ClubMember;
import com.campusconnect.entity.enums.ClubRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {

    Optional<ClubMember> findByClubIdAndUserId(Long clubId, Long userId);

    boolean existsByClubIdAndUserId(Long clubId, Long userId);

    List<ClubMember> findByClubId(Long clubId);

    List<ClubMember> findByUserId(Long userId);

    long countByClubId(Long clubId);

    List<ClubMember> findByClubIdAndClubRole(Long clubId, ClubRole clubRole);
}
