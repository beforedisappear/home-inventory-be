import { Injectable, Logger } from '@nestjs/common';

import { StorageService } from '@/libs/storage/storage.service';

import { AllowedImageMime } from '../constants/image';
import { recognitionStorageKey } from '../constants/storage-keys';

@Injectable()
export class RecognitionImageService {
  private readonly logger = new Logger(RecognitionImageService.name);

  constructor(private readonly storage: StorageService) {}

  async upload(
    ownerId: string,
    recognitionId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const key = recognitionStorageKey(
      ownerId,
      recognitionId,
      file.mimetype as AllowedImageMime,
    );

    await this.storage.upload(key, file);

    return key;
  }

  get(key: string): Promise<Buffer> {
    return this.storage.get(key);
  }

  async discard(key: string): Promise<void> {
    await this.storage.delete(key).catch((err) => {
      this.logger.warn(`failed to delete temp image ${key}: ${String(err)}`);
    });
  }
}
