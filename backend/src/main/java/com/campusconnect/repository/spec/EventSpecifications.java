package com.campusconnect.repository.spec;

import com.campusconnect.entity.Event;
import com.campusconnect.entity.enums.EventMode;
import com.campusconnect.entity.enums.EventStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Dynamic query building for event search/filter. */
public final class EventSpecifications {

    private EventSpecifications() {
    }

    public static Specification<Event> build(String q,
                                             String category,
                                             EventMode mode,
                                             EventStatus status,
                                             Long clubId,
                                             Boolean paid,
                                             Boolean team,
                                             Boolean featured,
                                             LocalDateTime from,
                                             LocalDateTime to,
                                             boolean includeUnpublished) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }
            if (mode != null) {
                predicates.add(cb.equal(root.get("mode"), mode));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else if (!includeUnpublished) {
                // Public listings never expose drafts or cancelled events.
                predicates.add(root.get("status").in(
                        EventStatus.PUBLISHED, EventStatus.UPCOMING, EventStatus.ONGOING, EventStatus.COMPLETED));
            }
            if (clubId != null) {
                predicates.add(cb.equal(root.get("club").get("id"), clubId));
            }
            if (paid != null) {
                predicates.add(cb.equal(root.get("paidEvent"), paid));
            }
            if (team != null) {
                predicates.add(cb.equal(root.get("teamEvent"), team));
            }
            if (featured != null) {
                predicates.add(cb.equal(root.get("featured"), featured));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDateTime"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startDateTime"), to));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
