package com.campusconnect.security;

import com.campusconnect.entity.enums.ClubRole;
import com.campusconnect.entity.enums.MembershipStatus;
import com.campusconnect.entity.enums.Role;
import com.campusconnect.exception.ForbiddenException;
import com.campusconnect.repository.ClubMemberRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Central authorization helper for club-scoped actions.
 * Membership is per-club (a global CLUB_COORDINATOR role only lets a user create/own clubs;
 * managing a specific club still requires an ACTIVE coordinator membership in that club).
 *
 * <p>The full-platform {@link Role#ADMIN} is intentionally <em>not</em> a member of every club,
 * so the {@code adminOr…} variants let an administrator perform club-scoped management actions
 * (revoke certificates, refund payments, cancel registrations, mark attendance) without holding a
 * per-club membership. Admin status is resolved from the user's persisted global role.
 */
@Component
@RequiredArgsConstructor
public class ClubAccess {

    private final ClubMemberRepository clubMemberRepository;
    private final UserRepository userRepository;

    public boolean isActiveMember(Long clubId, Long userId) {
        return clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .isPresent();
    }

    public boolean isCoordinator(Long clubId, Long userId) {
        return clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE && m.getClubRole() == ClubRole.COORDINATOR)
                .isPresent();
    }

    /** True when the user holds the global full-platform ADMIN role. */
    public boolean isPlatformAdmin(Long userId) {
        return userRepository.findById(userId)
                .map(u -> u.getRole() == Role.ADMIN)
                .orElse(false);
    }

    public boolean isAdminOrCoordinator(Long clubId, Long userId) {
        return isPlatformAdmin(userId) || isCoordinator(clubId, userId);
    }

    public boolean isAdminOrActiveMember(Long clubId, Long userId) {
        return isPlatformAdmin(userId) || isActiveMember(clubId, userId);
    }

    public void requireActiveMember(Long clubId, Long userId) {
        if (!isActiveMember(clubId, userId)) {
            throw new ForbiddenException("You must be an active member of this club to perform this action.");
        }
    }

    public void requireCoordinator(Long clubId, Long userId) {
        if (!isCoordinator(clubId, userId)) {
            throw new ForbiddenException("Only a coordinator of this club can perform this action.");
        }
    }

    /** Allow a platform admin, or an active coordinator of the club. */
    public void requireAdminOrCoordinator(Long clubId, Long userId) {
        if (!isAdminOrCoordinator(clubId, userId)) {
            throw new ForbiddenException(
                    "Only an administrator or a coordinator of this club can perform this action.");
        }
    }

    /** Allow a platform admin, or any active member of the club. */
    public void requireAdminOrActiveMember(Long clubId, Long userId) {
        if (!isAdminOrActiveMember(clubId, userId)) {
            throw new ForbiddenException(
                    "Only an administrator or an active member of this club can perform this action.");
        }
    }
}
