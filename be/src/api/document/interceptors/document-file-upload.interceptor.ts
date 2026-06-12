import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  DOCUMENT_MAX_SIZE_BYTES,
  DOCUMENT_MIME_TO_EXT,
} from '../constants/document';
import { DocumentMime } from '../interfaces/document.types';

const ALLOWED_DOCUMENT_MIMES = Object.keys(
  DOCUMENT_MIME_TO_EXT,
) as DocumentMime[];

export const DocumentFileInterceptor = (field = 'file') =>
  FileInterceptor(field, {
    limits: { fileSize: DOCUMENT_MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_DOCUMENT_MIMES.includes(file.mimetype as DocumentMime)) {
        const err = new BadRequestException(
          `unsupported mime type: ${file.mimetype}. allowed: ${ALLOWED_DOCUMENT_MIMES.join(', ')}`,
        );

        return cb(err, false);
      }
      cb(null, true);
    },
  });
