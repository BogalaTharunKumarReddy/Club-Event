package com.campusconnect.dto.response;

<<<<<<< HEAD
import com.campusconnect.entity.enums.EventStatus;
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
import com.campusconnect.entity.enums.RegistrationStatus;
import com.campusconnect.entity.enums.RegistrationType;

import java.time.Instant;

public record RegistrationResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long userId,
        String userName,
        Long teamId,
        String teamName,
        RegistrationType type,
        RegistrationStatus status,
        String ticketCode,
<<<<<<< HEAD
        boolean paidEvent,
        boolean ticketReady,
        boolean ticketVerified,
        EventStatus eventStatus,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
        Instant createdAt
) {
}
