export const ITEM_PHOTO_MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic',
} as const;

export type ItemPhotoMime = keyof typeof ITEM_PHOTO_MIME_TO_EXT;

export const ALLOWED_PHOTO_MIMES = Object.keys(
  ITEM_PHOTO_MIME_TO_EXT,
) as ItemPhotoMime[];

/** Лимит размера одного фото — 10 MB. */
export const ITEM_PHOTO_MAX_SIZE_BYTES = 10 * 1024 * 1024;
