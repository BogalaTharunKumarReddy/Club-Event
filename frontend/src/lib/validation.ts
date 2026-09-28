import { z } from 'zod';

/**
 * Shared zod field for an image reference chosen via {@link ImageUpload}.
 *
 * The value is never typed by the user — it is whatever the upload endpoint returns. With the
 * default local storage backend that is a RELATIVE app path such as `/api/files/<key>`; with an S3
 * backend it is an absolute `https://…` URL. Plain `z.string().url()` rejects the relative form,
 * which is exactly why uploaded images used to fail submission with "Enter a valid URL". This field
 * accepts a relative `/…` path, an absolute http(s) URL, or empty (image removed / never set).
 */
export const optionalImageUrl = z
  .string()
  .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//i.test(v), {
    message: 'That image could not be read. Please upload it again.',
  })
  .optional();
