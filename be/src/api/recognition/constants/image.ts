// Форматы кадра для распознавания. Локальные для фичи — recognition самодостаточен
// и не зависит от фото-констант item (совпадение наборов сегодня — случайность).
export const IMAGE_MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
} as const;

export type AllowedImageMime = keyof typeof IMAGE_MIME_TO_EXT;

export const ALLOWED_IMAGE_MIMES = Object.keys(
  IMAGE_MIME_TO_EXT,
) as AllowedImageMime[];

/** Лимит размера кадра — 10 MB. */
export const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
