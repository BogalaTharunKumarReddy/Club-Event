import { useState } from 'react';
import { Film, ImageIcon, ImagePlus, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { mediaService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { cn, errorMessage, fromNow } from '@/lib/utils';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  Skeleton,
  TextInput,
} from '@/components/ui';
import { ImageUpload } from './ImageUpload';
import type { MediaResponse, MediaType } from '@/types';

interface MediaGalleryProps {
  /** Provide exactly one of eventId / clubId — which gallery to show. */
  eventId?: number;
  clubId?: number;
  /** Show the "Add media" controls (a platform admin or an active club member). */
  canContribute?: boolean;
  /**
   * Allow deleting ANY item (a coordinator/admin of the owning club).
   * Uploaders can always delete their own items regardless of this flag.
   */
  canManageAll?: boolean;
}

/**
 * Reusable photo/video gallery for an event or a club. Reads are public; adding and
 * deleting are gated by the caller via {@code canContribute}/{@code canManageAll}
 * (the backend enforces the same rules). Images open in a lightbox; videos are
 * external links opened in a new tab.
 */
export function MediaGallery({
  eventId,
  clubId,
  canContribute = false,
  canManageAll = false,
}: MediaGalleryProps) {
  const { user } = useAuth();

  const { data, loading, error, reload } = useQuery<MediaResponse[]>(
    () =>
      eventId != null
        ? mediaService.forEvent(eventId)
        : clubId != null
          ? mediaService.forClub(clubId)
          : Promise.resolve<MediaResponse[]>([]),
    [eventId, clubId],
  );

  const [adding, setAdding] = useState(false);
  const [lightbox, setLightbox] = useState<MediaResponse | null>(null);
  const [toDelete, setToDelete] = useState<MediaResponse | null>(null);

  const items = data ?? [];

  const canDelete = (item: MediaResponse) =>
    canManageAll || (user != null && item.uploadedById === user.id);

  async function handleDelete() {
    if (!toDelete) return;
    // On success ConfirmDialog closes itself; on failure it surfaces the error and stays open.
    await mediaService.remove(toDelete.id);
    toast.success('Media removed.');
    reload();
  }

  return (
    <div className="space-y-4">
      {canContribute && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {items.length} item{items.length === 1 ? '' : 's'}
          </p>
          <Button
            variant={adding ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setAdding((v) => !v)}
          >
            {adding ? (
              'Close'
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add media
              </>
            )}
          </Button>
        </div>
      )}

      {canContribute && adding && (
        <AddMediaPanel
          eventId={eventId}
          clubId={clubId}
          onAdded={() => {
            setAdding(false);
            reload();
          }}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-6 w-6" />}
          title="No photos or videos yet"
          description={
            canContribute
              ? 'Add the first item to this gallery.'
              : 'Check back later — organisers post highlights here.'
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <GalleryTile
              key={item.id}
              item={item}
              canDelete={canDelete(item)}
              onOpen={() => {
                if (item.mediaType === 'IMAGE') setLightbox(item);
                else window.open(item.url, '_blank', 'noopener,noreferrer');
              }}
              onDelete={() => setToDelete(item)}
            />
          ))}
        </div>
      )}

      {/* Image lightbox */}
      <Modal
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        title={lightbox?.caption || 'Photo'}
        size="lg"
      >
        {lightbox && (
          <div className="space-y-3">
            <img
              src={lightbox.url}
              alt={lightbox.caption ?? ''}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
              <span className="truncate">{lightbox.caption}</span>
              <span className="shrink-0">
                {lightbox.uploadedByName ? `by ${lightbox.uploadedByName} · ` : ''}
                {fromNow(lightbox.createdAt)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete media"
        message="This permanently removes the item from the gallery. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

/* ------------------------------ gallery tile ----------------------------- */

function GalleryTile({
  item,
  canDelete,
  onOpen,
  onDelete,
}: {
  item: MediaResponse;
  canDelete: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const isVideo = item.mediaType === 'VIDEO';
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={onOpen}
        className="block aspect-square w-full"
        aria-label={isVideo ? 'Open video' : 'View photo'}
      >
        {isVideo ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-900 text-white">
            <Film className="h-8 w-8" />
            <span className="line-clamp-2 px-2 text-center text-xs">
              {item.caption || 'Video'}
            </span>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.caption ?? ''}
            loading="lazy"
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        )}
      </button>

      {item.caption && !isVideo && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="line-clamp-1 text-xs text-white">{item.caption}</p>
        </div>
      )}

      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-1.5 top-1.5 rounded-md bg-black/50 p-1.5 text-white opacity-0 transition hover:bg-red-600 focus:opacity-100 group-hover:opacity-100"
          aria-label="Delete media"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ----------------------------- add-media panel --------------------------- */

function AddMediaPanel({
  eventId,
  clubId,
  onAdded,
}: {
  eventId?: number;
  clubId?: number;
  onAdded: () => void;
}) {
  const [mode, setMode] = useState<MediaType>('IMAGE');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const url = (mode === 'IMAGE' ? imageUrl : videoUrl).trim();
    if (!url) {
      toast.error(mode === 'IMAGE' ? 'Please upload an image first.' : 'Please paste a video URL.');
      return;
    }
    setBusy(true);
    try {
      await mediaService.create({
        eventId,
        clubId,
        url,
        mediaType: mode,
        caption: caption.trim() || undefined,
      });
      toast.success('Added to the gallery.');
      setImageUrl('');
      setVideoUrl('');
      setCaption('');
      onAdded();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add to the gallery.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-4 p-4">
      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
        {(['IMAGE', 'VIDEO'] as MediaType[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
              mode === m
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {m === 'IMAGE' ? <ImagePlus className="h-3.5 w-3.5" /> : <Film className="h-3.5 w-3.5" />}
            {m === 'IMAGE' ? 'Photo' : 'Video'}
          </button>
        ))}
      </div>

      {mode === 'IMAGE' ? (
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          folder="media"
          shape="square"
          label="Photo"
        />
      ) : (
        <Field
          label="Video URL"
          htmlFor="media-video-url"
          hint="Paste a YouTube, Vimeo or direct video link"
        >
          <TextInput
            id="media-video-url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
          />
        </Field>
      )}

      <Field label="Caption" htmlFor="media-caption" hint="Optional">
        <TextInput
          id="media-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          placeholder="Say something about this…"
        />
      </Field>

      <div className="flex justify-end">
        <Button onClick={submit} loading={busy}>
          Add to gallery
        </Button>
      </div>
    </div>
  );
}
