import { ItemPhotoMime } from './item-photo';

export const ITEM_PHOTO_QUEUE = 'item-photo';

export const ITEM_PHOTO_COMPRESS_JOB = 'compress';

export interface ItemPhotoCompressJobData {
  key: string;
  mimeType: ItemPhotoMime;
}
