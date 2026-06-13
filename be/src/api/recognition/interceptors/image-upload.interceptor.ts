import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ALLOWED_IMAGE_MIMES,
  AllowedImageMime,
  IMAGE_MAX_SIZE_BYTES,
} from '../constants/image';

export const RecognitionImageInterceptor = (field = 'file') =>
  FileInterceptor(field, {
    limits: { fileSize: IMAGE_MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype as AllowedImageMime)) {
        const err = new BadRequestException(
          `unsupported mime type: ${file.mimetype}. allowed: ${ALLOWED_IMAGE_MIMES.join(', ')}`,
        );

        return cb(err, false);
      }
      cb(null, true);
    },
  });
