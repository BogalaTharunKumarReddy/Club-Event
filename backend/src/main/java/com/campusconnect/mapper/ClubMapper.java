package com.campusconnect.mapper;

import com.campusconnect.dto.response.ClubMemberResponse;
import com.campusconnect.dto.response.ClubResponse;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubMember;
import com.campusconnect.entity.User;

public final class ClubMapper {

    private ClubMapper() {
    }

    public static ClubResponse toResponse(Club club, long memberCount, long eventCount) {
        return toResponse(club, memberCount, eventCount, 0L, false);
    }

    public static ClubResponse toResponse(Club club, long memberCount, long eventCount,
                                          long followerCount, boolean following) {
        if (club == null) {
            return null;
        }
        User creator = club.getCreatedBy();
        return new ClubResponse(
                club.getId(),
                club.getName(),
                club.getDescription(),
                club.getCategory(),
                club.getLogoUrl(),
                club.getCoverImageUrl(),
                club.getContactEmail(),
                club.getContactPhone(),
                club.isActive(),
                memberCount,
                eventCount,
                followerCount,
                following,
                creator != null ? creator.getId() : null,
                creator != null ? creator.getFullName() : null,
                club.getCreatedAt()
        );
    }

    public static ClubMemberResponse toMemberResponse(ClubMember member) {
        if (member == null) {
            return null;
        }
        Club club = member.getClub();
        User user = member.getUser();
        return new ClubMemberResponse(
                member.getId(),
                club != null ? club.getId() : null,
                club != null ? club.getName() : null,
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                user != null ? user.getEmail() : null,
                member.getClubRole(),
                member.getStatus(),
                member.getCreatedAt()
        );
    }
}
