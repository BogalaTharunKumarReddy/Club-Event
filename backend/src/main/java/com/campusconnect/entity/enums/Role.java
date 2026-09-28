package com.campusconnect.entity.enums;

/**
 * Global platform role used for Spring Security authorization.
 * A role hierarchy is configured so higher roles inherit lower-role permissions:
 * ADMIN &gt; CLUB_COORDINATOR &gt; CLUB_MEMBER &gt; STUDENT.
 *
 * <p>ADMIN is the full-platform administrator: it manages all users, clubs,
 * events, payments and certificates and is not scoped to any single club.
<<<<<<< HEAD
 *
 * <p>VOLUNTEER is a distinct operational role: volunteers support Club Members
 * and Coordinators during events. It is <em>not</em> part of the coordinator
 * chain and carries no management permissions — it only inherits STUDENT-level
 * browse/registration access so a volunteer can still explore and attend events.
 */
public enum Role {
    STUDENT,
    VOLUNTEER,
=======
 */
public enum Role {
    STUDENT,
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
    CLUB_MEMBER,
    CLUB_COORDINATOR,
    ADMIN
}
