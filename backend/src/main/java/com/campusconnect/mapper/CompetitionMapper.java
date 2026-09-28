package com.campusconnect.mapper;

import com.campusconnect.dto.response.CompetitionResponse;
import com.campusconnect.dto.response.CompetitionRoundResponse;
import com.campusconnect.dto.response.JudgeResponse;
import com.campusconnect.dto.response.ScoreResponse;
import com.campusconnect.entity.Competition;
import com.campusconnect.entity.CompetitionRound;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.Judge;
import com.campusconnect.entity.Score;
import com.campusconnect.entity.Team;
import com.campusconnect.entity.User;

public final class CompetitionMapper {

    private CompetitionMapper() {
    }

    public static CompetitionResponse toResponse(Competition competition, int roundCount, int judgeCount) {
        if (competition == null) {
            return null;
        }
        Event event = competition.getEvent();
        return new CompetitionResponse(
                competition.getId(),
                event != null ? event.getId() : null,
                event != null ? event.getTitle() : null,
                competition.getTitle(),
                competition.getDescription(),
                competition.getStatus(),
                competition.isTeamBased(),
                roundCount,
                judgeCount,
                competition.getCreatedAt()
        );
    }

    public static CompetitionRoundResponse toRoundResponse(CompetitionRound round) {
        if (round == null) {
            return null;
        }
        return new CompetitionRoundResponse(
                round.getId(),
                round.getCompetition() != null ? round.getCompetition().getId() : null,
                round.getName(),
                round.getRoundNumber(),
                round.getDescription(),
                round.getMaxScore(),
                round.getScheduledAt(),
                round.getCreatedAt()
        );
    }

    public static JudgeResponse toJudgeResponse(Judge judge) {
        if (judge == null) {
            return null;
        }
        User user = judge.getUser();
        return new JudgeResponse(
                judge.getId(),
                judge.getCompetition() != null ? judge.getCompetition().getId() : null,
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                user != null ? user.getEmail() : null
        );
    }

    public static ScoreResponse toScoreResponse(Score score) {
        if (score == null) {
            return null;
        }
        CompetitionRound round = score.getRound();
        Judge judge = score.getJudge();
        User judgeUser = judge != null ? judge.getUser() : null;
        User participant = score.getParticipant();
        Team team = score.getTeam();
        return new ScoreResponse(
                score.getId(),
                round != null ? round.getId() : null,
                round != null ? round.getName() : null,
                judge != null ? judge.getId() : null,
                judgeUser != null ? judgeUser.getFullName() : null,
                participant != null ? participant.getId() : null,
                participant != null ? participant.getFullName() : null,
                team != null ? team.getId() : null,
                team != null ? team.getName() : null,
                score.getPoints(),
                score.getRemarks(),
                score.getCreatedAt()
        );
    }
}
