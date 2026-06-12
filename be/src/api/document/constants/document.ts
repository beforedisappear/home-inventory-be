export const DOCUMENT_TYPES = [
  'receipt',
  'warranty',
  'manual',
  'other',
] as const;

export const DOCUMENT_MIME_TO_EXT = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
} as const;

/** Лимит размера одного документа — 20 MB. */
export const DOCUMENT_MAX_SIZE_BYTES = 20 * 1024 * 1024;
