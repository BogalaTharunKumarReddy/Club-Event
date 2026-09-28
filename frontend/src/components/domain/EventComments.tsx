import { useState } from 'react';
import {
  CheckCircle2,
  CornerDownRight,
  MessageSquare,
  Pencil,
  Pin,
  PinOff,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { commentService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { cn, errorMessage, fromNow } from '@/lib/utils';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
  TextArea,
} from '@/components/ui';
import type { CommentResponse } from '@/types';

interface EventCommentsProps {
  eventId: number;
  /**
   * Show moderation controls — pin/unpin, resolve/reopen and delete-any.
   * Pass true from the coordinator workspace / event-management screens; the
   * public event page leaves it false (global admins still see it). The backend
   * enforces the real authorization regardless of what the client renders.
   */
  canModerate?: boolean;
}

/**
 * Reusable discussion / Q&A thread for an event. Reads are public; posting,
 * replying, editing and moderating require the matching permissions (enforced
 * server-side). Single level of threading: replies attach to a top-level
 * comment. After every mutation we re-fetch the thread so ordering, reply
 * counts and organizer/resolved flags stay authoritative.
 */
export function EventComments({ eventId, canModerate = false }: EventCommentsProps) {
  const { user, isAuthenticated } = useAuth();

  const { data, loading, error, reload } = useQuery<CommentResponse[]>(
    () => commentService.forEvent(eventId),
    [eventId],
  );

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<CommentResponse | null>(null);

  const comments = data ?? [];
  const currentUserId = user?.id ?? null;
  const totalCount = comments.reduce((n, c) => n + 1 + c.replyCount, 0);

  async function postTopLevel(content: string) {
    await commentService.create(eventId, { content });
    reload();
  }

  async function postReply(parentId: number, content: string) {
    await commentService.create(eventId, { content, parentId });
    setReplyingTo(null);
    reload();
  }

  async function saveEdit(id: number, content: string) {
    await commentService.update(id, { content });
    setEditingId(null);
    reload();
  }

  // Thrown errors bubble to ConfirmDialog, which surfaces them and stays open.
  async function handleDelete() {
    if (!toDelete) return;
    await commentService.remove(toDelete.id);
    toast.success('Comment removed.');
    reload();
  }

  async function togglePin(c: CommentResponse) {
    setBusyId(c.id);
    try {
      await commentService.setPinned(c.id, !c.pinned);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the comment.'));
    } finally {
      setBusyId(null);
    }
  }

  async function toggleResolve(c: CommentResponse) {
    setBusyId(c.id);
    try {
      await commentService.setResolved(c.id, !c.resolved);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the comment.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Composer (top-level) */}
      {isAuthenticated ? (
        <div className="card p-4">
          <Composer
            placeholder="Ask a question or share something about this event…"
            submitLabel="Post"
            onSubmit={postTopLevel}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Log in to join the discussion or ask a question.
        </p>
      )}

      {/* Thread */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card space-y-2 p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : comments.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="No comments yet"
          description={
            isAuthenticated
              ? 'Be the first to start the conversation.'
              : 'Check back later — the discussion will appear here.'
          }
        />
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {totalCount} comment{totalCount === 1 ? '' : 's'}
          </p>
          <ul className="space-y-3">
            {comments.map((c) => (
              <CommentThread
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
                canModerate={canModerate}
                busy={busyId === c.id}
                isReplying={replyingTo === c.id}
                editingId={editingId}
                onStartReply={() => {
                  setEditingId(null);
                  setReplyingTo((prev) => (prev === c.id ? null : c.id));
                }}
                onCancelReply={() => setReplyingTo(null)}
                onReply={(content) => postReply(c.id, content)}
                onStartEdit={(id) => {
                  setReplyingTo(null);
                  setEditingId(id);
                }}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={saveEdit}
                onDelete={setToDelete}
                onTogglePin={() => togglePin(c)}
                onToggleResolve={() => toggleResolve(c)}
              />
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete comment"
        message={
          toDelete && toDelete.replyCount > 0
            ? 'This permanently removes the comment and all of its replies. This cannot be undone.'
            : 'This permanently removes the comment. This cannot be undone.'
        }
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

/* ------------------------------ thread item ----------------------------- */

interface CommentThreadProps {
  comment: CommentResponse;
  currentUserId: number | null;
  isAuthenticated: boolean;
  canModerate: boolean;
  busy: boolean;
  isReplying: boolean;
  editingId: number | null;
  onStartReply: () => void;
  onCancelReply: () => void;
  onReply: (content: string) => Promise<void>;
  onStartEdit: (id: number) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number, content: string) => Promise<void>;
  onDelete: (comment: CommentResponse) => void;
  onTogglePin: () => void;
  onToggleResolve: () => void;
}

function CommentThread({
  comment,
  currentUserId,
  isAuthenticated,
  canModerate,
  busy,
  isReplying,
  editingId,
  onStartReply,
  onCancelReply,
  onReply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onTogglePin,
  onToggleResolve,
}: CommentThreadProps) {
  const isAuthor = currentUserId != null && comment.authorId === currentUserId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || canModerate;
  const canResolve = isAuthor || canModerate;
  const editing = editingId === comment.id;

  return (
    <li
      className={cn(
        'card p-4',
        comment.pinned && 'border-brand-300 dark:border-brand-800',
        comment.resolved && 'border-emerald-300 dark:border-emerald-900',
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={comment.authorName} src={comment.authorPhotoUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <AuthorLine comment={comment} />

          {editing ? (
            <div className="mt-2">
              <Composer
                initialValue={comment.content}
                placeholder="Edit your comment…"
                submitLabel="Save"
                autoFocus
                onSubmit={(content) => onSaveEdit(comment.id, content)}
                onCancel={onCancelEdit}
              />
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">
              {comment.content}
            </p>
          )}

          {/* Action row */}
          {!editing && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={onStartReply}
                  className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
                >
                  <CornerDownRight className="h-3.5 w-3.5" /> Reply
                </button>
              )}
              {canModerate && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onTogglePin}
                  className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-brand-600 disabled:opacity-50 dark:text-slate-400"
                >
                  {comment.pinned ? (
                    <>
                      <PinOff className="h-3.5 w-3.5" /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-3.5 w-3.5" /> Pin
                    </>
                  )}
                </button>
              )}
              {canResolve && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onToggleResolve}
                  className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-emerald-600 disabled:opacity-50 dark:text-slate-400"
                >
                  {comment.resolved ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" /> Reopen
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </>
                  )}
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onStartEdit(comment.id)}
                  className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment)}
                  className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}
            </div>
          )}

          {/* Reply composer */}
          {isReplying && (
            <div className="mt-3">
              <Composer
                placeholder={`Reply to ${comment.authorName}…`}
                submitLabel="Reply"
                autoFocus
                onSubmit={onReply}
                onCancel={onCancelReply}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <ul className="mt-3 space-y-3 border-l-2 border-slate-100 pl-4 dark:border-slate-800">
              {comment.replies.map((r) => (
                <ReplyRow
                  key={r.id}
                  reply={r}
                  currentUserId={currentUserId}
                  canModerate={canModerate}
                  isEditing={editingId === r.id}
                  onStartEdit={() => onStartEdit(r.id)}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={onSaveEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

/* -------------------------------- reply --------------------------------- */

interface ReplyRowProps {
  reply: CommentResponse;
  currentUserId: number | null;
  canModerate: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number, content: string) => Promise<void>;
  onDelete: (comment: CommentResponse) => void;
}

function ReplyRow({
  reply,
  currentUserId,
  canModerate,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: ReplyRowProps) {
  const isAuthor = currentUserId != null && reply.authorId === currentUserId;
  const canDelete = isAuthor || canModerate;

  return (
    <li className="flex items-start gap-2.5">
      <Avatar name={reply.authorName} src={reply.authorPhotoUrl} size="xs" />
      <div className="min-w-0 flex-1">
        <AuthorLine comment={reply} />
        {isEditing ? (
          <div className="mt-2">
            <Composer
              initialValue={reply.content}
              placeholder="Edit your reply…"
              submitLabel="Save"
              rows={2}
              autoFocus
              onSubmit={(content) => onSaveEdit(reply.id, content)}
              onCancel={onCancelEdit}
            />
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">
            {reply.content}
          </p>
        )}
        {!isEditing && (isAuthor || canDelete) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {isAuthor && (
              <button
                type="button"
                onClick={onStartEdit}
                className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(reply)}
                className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/* ------------------------------ shared bits ----------------------------- */

/** Author name + badges + timestamp line, shared by comments and replies. */
function AuthorLine({ comment }: { comment: CommentResponse }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {comment.authorName}
      </span>
      {comment.fromOrganizer && (
        <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          <ShieldCheck className="mr-1 h-3 w-3" /> Organizer
        </Badge>
      )}
      {comment.pinned && (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Pin className="mr-1 h-3 w-3" /> Pinned
        </Badge>
      )}
      {comment.resolved && (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
        </Badge>
      )}
      <span className="text-xs text-slate-400">
        {fromNow(comment.createdAt)}
        {comment.edited ? ' · edited' : ''}
      </span>
    </div>
  );
}

/* ------------------------------- composer ------------------------------- */

interface ComposerProps {
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  autoFocus?: boolean;
  rows?: number;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

function Composer({
  placeholder,
  submitLabel,
  initialValue = '',
  autoFocus = false,
  rows = 3,
  onSubmit,
  onCancel,
}: ComposerProps) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const content = value.trim();
    if (!content) {
      toast.error('Please write something first.');
      return;
    }
    setBusy(true);
    try {
      await onSubmit(content);
      setValue('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not post. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={4000}
        autoFocus={autoFocus}
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={submit} loading={busy}>
          <Send className="h-4 w-4" /> {submitLabel}
        </Button>
      </div>
    </div>
  );
}
