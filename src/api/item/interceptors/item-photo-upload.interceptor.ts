import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ALLOWED_PHOTO_MIMES,
  ITEM_PHOTO_MAX_SIZE_BYTES,
  ItemPhotoMime,
} from '../constants/item-photo';

export const ItemPhotoFileInterceptor = (field = 'file') =>
  FileInterceptor(field, {
    limits: { fileSize: ITEM_PHOTO_MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_PHOTO_MIMES.includes(file.mimetype as ItemPhotoMime)) {
        const err = new BadRequestException(
          `unsupported mime type: ${file.mimetype}. allowed: ${ALLOWED_PHOTO_MIMES.join(', ')}`,
        );

        return cb(err, false);
      }
      cb(null, true);
    },
  });
