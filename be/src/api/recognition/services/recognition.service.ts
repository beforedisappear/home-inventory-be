import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Queue } from 'bullmq';

import {
  RECOGNITION_QUEUE,
  RECOGNITION_RECOGNIZE_JOB,
} from '../constants/recognition-queue';
import { type RecognitionRecognizeJobData } from '../interfaces/recognition-recognize.interface';
import { RecognitionMapper } from '../mappers/recognition.mapper';
import { RecognitionRepository } from '../repositories/recognition.repository';
import { RecognitionImageService } from './recognition-image.service';

@Injectable()
export class RecognitionService {
  constructor(
    private readonly repo: RecognitionRepository,
    private readonly images: RecognitionImageService,

    @InjectQueue(RECOGNITION_QUEUE)
    private readonly queue: Queue<RecognitionRecognizeJobData>,
  ) {}

  async create(ownerId: string, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('image file is required');

    // одно активное распознавание на юзера — не сжигаем лимиты провайдера
    if (await this.repo.hasActive(ownerId))
      throw new ConflictException('Active recognition already in progress');

    const created = await this.repo.create(ownerId);

    const id = created._id.toString();

    const key = await this.images.upload(ownerId, id, file);

    const updated = await this.repo.setImage(id, key, file.mimetype);

    await this.queue.add(RECOGNITION_RECOGNIZE_JOB, {
      recognitionId: id,
      ownerId,
    });

    return RecognitionMapper.toResponseDto(updated!);
  }

  async findById(ownerId: string, id: string) {
    const found = await this.repo.findByIdAndOwner(id, ownerId);

    if (!found) throw new NotFoundException('Recognition not found');

    return RecognitionMapper.toResponseDto(found);
  }

  async findAll(ownerId: string) {
    const all = await this.repo.findAllByOwner(ownerId);

    return all.map((r) => RecognitionMapper.toResponseDto(r));
  }

  async cancel(ownerId: string, id: string) {
    const existing = await this.repo.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundException('Recognition not found');

    const cancelled = await this.repo.cancel(id, ownerId);

    // отменили активное — временный кадр больше не нужен
    if (cancelled && cancelled.imageKey)
      await this.images.discard(cancelled.imageKey);

    return RecognitionMapper.toResponseDto(cancelled ?? existing);
  }
}
