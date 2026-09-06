package com.campusconnect.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Hard-deletes an event or a club together with every row that references it.
 *
 * <p>The schema is created with {@code ddl-auto=update}, which never emits
 * {@code ON DELETE CASCADE}, and the JPA associations intentionally carry no
 * cascade rules (so an accidental {@code save} can never wipe related data).
 * That means a plain {@code repository.delete(event)} throws a foreign-key
 * violation the moment any child row exists — which is why admin/coordinator
 * deletes appeared to "do nothing" (the violation was caught and turned into a
 * 409). This service removes the children in dependency order first, inside the
 * caller's transaction, so the final parent delete always succeeds.</p>
 *
 * <p>All statements are parameterised JPQL bulk deletes keyed by id — no user
 * input is interpolated into the query text.</p>
 */
@Service
public class EntityPurgeService {

    @PersistenceContext
    private EntityManager em;

    /**
     * Delete a single event and all of its dependent rows.
     * Ordered from the deepest descendants up to the event itself.
     */
    @Transactional
    public void purgeEvent(Long eventId) {
        // Competition subtree: scores -> rounds/judges -> competitions
        exec("delete from Score s where s.round.id in "
                + "(select r.id from CompetitionRound r where r.competition.id in "
                + "(select c.id from Competition c where c.event.id = :id))", eventId);
        exec("delete from CompetitionRound r where r.competition.id in "
                + "(select c.id from Competition c where c.event.id = :id)", eventId);
        exec("delete from Judge j where j.competition.id in "
                + "(select c.id from Competition c where c.event.id = :id)", eventId);
        exec("delete from Competition c where c.event.id = :id", eventId);

        // Volunteer subtree: tasks -> volunteers
        exec("delete from VolunteerTask t where t.volunteer.id in "
                + "(select v.id from Volunteer v where v.event.id = :id)", eventId);
        exec("delete from Volunteer v where v.event.id = :id", eventId);

        // Rows that reference a registration must go before the registrations.
        exec("delete from Attendance a where a.event.id = :id", eventId);
        exec("delete from Payment p where p.event.id = :id", eventId);
        exec("delete from Registration r where r.event.id = :id", eventId);

        // Team subtree: members -> teams (registrations already gone).
        exec("delete from TeamMember tm where tm.team.id in "
                + "(select t.id from Team t where t.event.id = :id)", eventId);
        exec("delete from Team t where t.event.id = :id", eventId);

        // Remaining direct children of the event.
        exec("delete from Certificate c where c.event.id = :id", eventId);
        exec("delete from CertificateTemplate ct where ct.event.id = :id", eventId);
        exec("delete from Feedback f where f.event.id = :id", eventId);
        exec("delete from EventSchedule s where s.event.id = :id", eventId);
        exec("delete from SavedEvent se where se.event.id = :id", eventId);
        exec("delete from Media m where m.event.id = :id", eventId);
        exec("delete from Announcement a where a.event.id = :id", eventId);

        // Comments self-reference via parent_id, so remove replies before roots.
        exec("delete from Comment c where c.event.id = :id and c.parent is not null", eventId);
        exec("delete from Comment c where c.event.id = :id", eventId);

        exec("delete from Event e where e.id = :id", eventId);
    }

    /**
     * Delete a club and everything under it, including all of its events.
     */
    @Transactional
    public void purgeClub(Long clubId) {
        List<Long> eventIds = em.createQuery(
                        "select e.id from Event e where e.club.id = :id", Long.class)
                .setParameter("id", clubId)
                .getResultList();
        for (Long eventId : eventIds) {
            purgeEvent(eventId);
        }

        exec("delete from ClubMember cm where cm.club.id = :id", clubId);
        exec("delete from ClubFollow cf where cf.club.id = :id", clubId);
        exec("delete from Media m where m.club.id = :id", clubId);
        exec("delete from Announcement a where a.club.id = :id", clubId);

        exec("delete from Club c where c.id = :id", clubId);
    }

    private void exec(String jpql, Long id) {
        em.createQuery(jpql).setParameter("id", id).executeUpdate();
    }
}
