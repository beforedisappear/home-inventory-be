import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

import { StorageService } from '@/libs/storage/storage.service';

import { ItemPhoto } from '../schemas/item-photo.schema';
import { ItemPhotoResponseDto } from '../dto/item-photo-response.dto';
import { userStoragePrefix } from '../constants/storage-keys';
import { ITEM_PHOTO_MIME_TO_EXT, ItemPhotoMime } from '../constants/item-photo';
import {
  ITEM_PHOTO_COMPRESS_JOB,
  ITEM_PHOTO_QUEUE,
  ItemPhotoCompressJobData,
} from '../constants/item-photo-queue';

@Injectable()
export class ItemPhotoService {
  constructor(
    private readonly storage: StorageService,

    @InjectQueue(ITEM_PHOTO_QUEUE)
    private readonly queue: Queue<ItemPhotoCompressJobData>,
  ) {}

  async upload(
    ownerId: string,
    file: Express.Multer.File,
  ): Promise<ItemPhotoResponseDto> {
    if (!file) throw new BadRequestException('file is required');

    const mimeType = file.mimetype as ItemPhotoMime;

    // mime/size уже отвалидированы PhotoFileInterceptor — mime гарантированно из whitelist
    const ext = ITEM_PHOTO_MIME_TO_EXT[mimeType];

    const key = `${userStoragePrefix(ownerId)}${uuidv4()}${ext}`;

    await this.storage.upload(key, file);

    // фоновое сжатие — воркер перезапишет файл по этому же key
    // attempts/backoff/cleanup — из forRoot.defaultJobOptions
    await this.queue.add(ITEM_PHOTO_COMPRESS_JOB, { key, mimeType });

    return {
      key,
      url: this.storage.buildUrl(key),
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async resolve(
    ownerId: string,
    existing: ItemPhoto[],
    nextKeys: string[],
  ): Promise<ItemPhoto[]> {
    const existingMap = new Map(existing.map((p) => [p.key, p]));
    const nextSet = new Set(nextKeys);

    // удалённые из S3
    const removed = existing
      .filter((p) => !nextSet.has(p.key))
      .map((p) => p.key);
    await this.deleteFromStorage(removed);

    return Promise.all(
      nextKeys.map(async (key) => {
        const existed = existingMap.get(key);
        if (existed) return existed;

        this.assertOwnsKey(ownerId, key);

        try {
          const meta = await this.storage.head(key);
          return { key, mimeType: meta.mimeType, size: meta.size };
        } catch {
          throw new BadRequestException(`photo not found in storage: ${key}`);
        }
      }),
    );
  }

  async deleteAll(keys: string[]) {
    return this.deleteFromStorage(keys);
  }

  private assertOwnsKey(ownerId: string, key: string) {
    if (!key.startsWith(userStoragePrefix(ownerId))) {
      throw new BadRequestException('photo key does not belong to user');
    }
  }

  private async deleteFromStorage(keys: string[]) {
    if (keys.length === 0) return;
    await Promise.all(
      keys.map((k) => this.storage.delete(k).catch(() => undefined)),
    );
  }
}
