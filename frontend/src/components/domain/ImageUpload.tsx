import { useRef, useState } from 'react';
import { ImageIcon, Link2, Loader2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { fileService } from '@/lib/services';
import { cn, errorMessage } from '@/lib/utils';
import { Field, TextInput } from '@/components/ui';

type Shape = 'wide' | 'square' | 'circle';

const SHAPE_CLASSES: Record<Shape, string> = {
  wide: 'aspect-video w-full',
  square: 'h-32 w-32',
  circle: 'h-24 w-24 rounded-full',
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB — comfortably under the server's 10 MB cap.

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  /** Storage prefix, e.g. 'avatars', 'banners', 'logos', 'media'. */
  folder: string;
  label?: string;
  hint?: string;
  error?: string;
  shape?: Shape;
  /** Show a collapsible "paste a URL instead" input (handy for external images). Default true. */
  allowUrl?: boolean;
  className?: string;
}

/**
 * Reusable image picker backed by the upload endpoint. Manages a single URL string: uploading a
 * file stores it via the active StorageService and reports back the resolvable URL. Falsy value =
 * nothing selected. Optionally exposes a manual URL field for external/CDN images.
 */
export function ImageUpload({
  value,
  onChange,
  folder,
  label,
  hint,
  error,
  shape = 'wide',
  allowUrl = true,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Image is larger than 8 MB.');
      return;
    }
    setUploading(true);
    try {
      const result = await fileService.upload(file, folder);
      onChange(result.url);
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <div className="flex items-start gap-4">
        {/* Preview / drop target */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'group relative flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-brand-400 hover:text-brand-500 dark:border-slate-600 dark:bg-slate-800/50',
            SHAPE_CLASSES[shape],
            rounded,
          )}
          aria-label="Upload image"
        >
          {value ? (
            <img src={value} alt="" className={cn('h-full w-full object-cover', rounded)} />
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
          )}
        </button>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              {value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="btn-ghost px-3 py-1.5 text-xs text-red-600 dark:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
            {allowUrl && (
              <button
                type="button"
                onClick={() => setShowUrl((s) => !s)}
                className="btn-ghost px-3 py-1.5 text-xs"
              >
                <Link2 className="h-3.5 w-3.5" />
                URL
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            PNG, JPG, GIF or WEBP · up to 8 MB
          </p>
          {allowUrl && showUrl && (
            <TextInput
              type="url"
              placeholder="https://…"
              defaultValue={value ?? ''}
              onBlur={(e) => onChange(e.target.value.trim())}
              className="w-72 max-w-full text-xs"
            />
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </Field>
  );
}
