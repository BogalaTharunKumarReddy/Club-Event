package com.campusconnect.service.impl;

import com.campusconnect.dto.request.CommentRequest;
import com.campusconnect.dto.request.CommentUpdateRequest;
import com.campusconnect.dto.response.CommentResponse;
import com.campusconnect.entity.Comment;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.User;
import com.campusconnect.entity.enums.ClubRole;
import com.campusconnect.entity.enums.MembershipStatus;
import com.campusconnect.entity.enums.NotificationType;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ForbiddenException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.mapper.CommentMapper;
import com.campusconnect.repository.ClubMemberRepository;
import com.campusconnect.repository.CommentRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.ClubAccess;
import com.campusconnect.service.CommentService;
import com.campusconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubAccess clubAccess;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CommentResponse create(Long actingUserId, Long eventId, CommentRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        User author = userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", actingUserId));

        Long clubId = event.getClub() != null ? event.getClub().getId() : null;
        boolean organizer = clubId != null && clubAccess.isAdminOrCoordinator(clubId, actingUserId);

        Comment parent = null;
        if (request.parentId() != null) {
            parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.parentId()));
            if (parent.getEvent() == null || !parent.getEvent().getId().equals(eventId)) {
                throw new BadRequestException("The comment you are replying to belongs to a different event.");
            }
            // Collapse deeper nesting: a reply always attaches to the top-level comment.
            if (parent.getParent() != null) {
                Long topId = parent.getParent().getId();
                parent = commentRepository.findById(topId)
                        .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", topId));
            }
        }

        Comment comment = Comment.builder()
                .event(event)
                .author(author)
                .parent(parent)
                .content(request.content().trim())
                .fromOrganizer(organizer)
                .build();
        Comment saved = commentRepository.save(comment);

        notifyOnPost(event, saved, parent, author);

        return parent == null
                ? CommentMapper.toThread(saved, List.of())
                : CommentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CommentResponse update(Long actingUserId, Long commentId, CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        if (comment.getAuthor() == null || !comment.getAuthor().getId().equals(actingUserId)) {
            throw new ForbiddenException("You can only edit your own comments.");
        }
        comment.setContent(request.content().trim());
        comment.setEdited(true);
        return withReplies(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void delete(Long actingUserId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        boolean isAuthor = comment.getAuthor() != null && comment.getAuthor().getId().equals(actingUserId);
        if (!isAuthor && !canModerate(comment, actingUserId)) {
            throw new ForbiddenException("You are not allowed to delete this comment.");
        }
        // Removing a top-level comment removes its replies too.
        if (comment.getParent() == null) {
            commentRepository.deleteByParentId(comment.getId());
        }
        commentRepository.delete(comment);
    }

    @Override
    @Transactional
    public CommentResponse setPinned(Long actingUserId, Long commentId, boolean pinned) {
        Comment comment = requireTopLevel(commentId, "pin");
        requireModerator(comment, actingUserId);
        comment.setPinned(pinned);
        return withReplies(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public CommentResponse setResolved(Long actingUserId, Long commentId, boolean resolved) {
        Comment comment = requireTopLevel(commentId, "resolve");
        boolean isAuthor = comment.getAuthor() != null && comment.getAuthor().getId().equals(actingUserId);
        if (!isAuthor && !canModerate(comment, actingUserId)) {
            throw new ForbiddenException("Only a coordinator or the original author can change this.");
        }
        comment.setResolved(resolved);
        return withReplies(commentRepository.save(comment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> listByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", "id", eventId);
        }
        List<Comment> tops =
                commentRepository.findByEventIdAndParentIsNullOrderByPinnedDescCreatedAtDesc(eventId);
        Map<Long, List<Comment>> repliesByParent =
                commentRepository.findByEventIdAndParentIsNotNullOrderByCreatedAtAsc(eventId).stream()
                        .filter(r -> r.getParent() != null)
                        .collect(Collectors.groupingBy(r -> r.getParent().getId()));
        return tops.stream()
                .map(top -> CommentMapper.toThread(top, repliesByParent.getOrDefault(top.getId(), List.of())))
                .toList();
    }

    // ---- helpers ----

    /** Re-map a mutated comment, nesting replies for a top-level one so the client can swap it in place. */
    private CommentResponse withReplies(Comment comment) {
        if (comment.getParent() != null) {
            return CommentMapper.toResponse(comment);
        }
        return CommentMapper.toThread(comment,
                commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId()));
    }

    private Comment requireTopLevel(Long commentId, String action) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        if (comment.getParent() != null) {
            throw new BadRequestException("You can only " + action + " a top-level comment.");
        }
        return comment;
    }

    private void requireModerator(Comment comment, Long userId) {
        if (!canModerate(comment, userId)) {
            throw new ForbiddenException("Only an administrator or a coordinator of this club can do that.");
        }
    }

    private boolean canModerate(Comment comment, Long userId) {
        Event event = comment.getEvent();
        if (event == null || event.getClub() == null) {
            return false;
        }
        return clubAccess.isAdminOrCoordinator(event.getClub().getId(), userId);
    }

    private void notifyOnPost(Event event, Comment comment, Comment parent, User author) {
        String link = "/events/" + event.getId();
        if (parent != null) {
            // Reply → let the parent comment's author know (unless they replied to themselves).
            User parentAuthor = parent.getAuthor();
            if (parentAuthor != null && !parentAuthor.getId().equals(author.getId())) {
                notificationService.notifyUser(parentAuthor.getId(), NotificationType.GENERAL,
                        "New reply to your comment",
                        author.getFullName() + " replied on " + event.getTitle(), link);
            }
        } else {
            // New top-level question → notify the event's active coordinators so they can answer.
            notifyEventCoordinators(event, author, link);
        }
    }

    private void notifyEventCoordinators(Event event, User author, String link) {
        if (event.getClub() == null) {
            return;
        }
        for (var member : clubMemberRepository.findByClubId(event.getClub().getId())) {
            if (member.getStatus() != MembershipStatus.ACTIVE
                    || member.getClubRole() != ClubRole.COORDINATOR
                    || member.getUser() == null) {
                continue;
            }
            Long recipientId = member.getUser().getId();
            if (recipientId.equals(author.getId())) {
                continue;
            }
            notificationService.notifyUser(recipientId, NotificationType.GENERAL,
                    "New question on " + event.getTitle(),
                    author.getFullName() + " posted a question", link);
        }
    }
}
