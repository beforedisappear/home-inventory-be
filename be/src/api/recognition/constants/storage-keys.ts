import { AllowedImageMime, IMAGE_MIME_TO_EXT } from './image';

// временный ключ кадра, который удаляется сразу после распознавания
export const recognitionStorageKey = (
  ownerId: string,
  recognitionId: string,
  mime: AllowedImageMime,
): string =>
  `users/${ownerId}/recognitions/${recognitionId}${IMAGE_MIME_TO_EXT[mime]}`;
