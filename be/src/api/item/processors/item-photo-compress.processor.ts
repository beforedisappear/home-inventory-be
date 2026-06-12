import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

import { Job } from 'bullmq';
import sharp from 'sharp';

import { StorageService } from '@/libs/storage/storage.service';

import { ItemPhotoMime } from '../constants/item-photo';
import {
  ITEM_PHOTO_COMPRESS_JOB,
  ITEM_PHOTO_QUEUE,
  ItemPhotoCompressJobData,
} from '../constants/item-photo-queue';
import { ItemRepository } from '../repositories/item.repository';

@Processor(ITEM_PHOTO_QUEUE)
export class ItemPhotoCompressProcessor extends WorkerHost {
  private readonly logger = new Logger(ItemPhotoCompressProcessor.name);

  constructor(
    private readonly storage: StorageService,
    private readonly repo: ItemRepository,
  ) {
    super();
  }

  async process(job: Job<ItemPhotoCompressJobData>) {
    if (job.name !== ITEM_PHOTO_COMPRESS_JOB) {
      this.logger.warn(`unknown job name: ${job.name}`);
      return;
    }

    const { key, mimeType } = job.data;

    const original = await this.storage.get(key);

    const compressed = await this.compress(original, mimeType);

    // если сжатие не сэкономило байты — оставляем оригинал
    if (compressed.length >= original.length) {
      this.logger.log(
        `compress skip (no gain): key=${key} orig=${original.length} compr=${compressed.length}`,
      );
      return;
    }

    await this.storage.uploadBuffer(key, compressed, mimeType);

    await this.repo.updatePhotoSize(key, compressed.length);

    const saved = (
      ((original.length - compressed.length) / original.length) *
      100
    ).toFixed(1);

    this.logger.log(
      `compress done: key=${key} ${original.length} → ${compressed.length} (-${saved}%)`,
    );
  }

  private compress(buf: Buffer, mime: ItemPhotoMime): Promise<Buffer> {
    const pipeline = sharp(buf);

    switch (mime) {
      case 'image/jpeg':
        // mozjpeg даёт +10-15% к стандартной libjpeg
        return pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();

      case 'image/png':
        // compressionLevel — про deflate. quality — для palette PNG.
        return pipeline
          .png({ quality: 80, compressionLevel: 9, palette: true })
          .toBuffer();

      case 'image/webp':
        return pipeline.webp({ quality: 80 }).toBuffer();

      default:
        return Promise.resolve(buf);
    }
  }
}
