import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { RECOGNITION_ACTIVE_STATUSES } from '../interfaces/recognition-status.types';
import { RecognitionDraft } from '../schemas/recognition-draft.schema';
import {
  Recognition,
  RecognitionDocument,
} from '../schemas/recognition.schema';

@Injectable()
export class RecognitionRepository {
  constructor(
    @InjectModel(Recognition.name)
    private readonly model: Model<RecognitionDocument>,
  ) {}

  create(ownerId: string) {
    return this.model.create({ ownerId });
  }

  // есть ли у юзера незавершённое распознавание — повторный запуск отбиваем 409
  hasActive(ownerId: string) {
    return this.model
      .exists({ ownerId, status: { $in: RECOGNITION_ACTIVE_STATUSES } })
      .exec();
  }

  findByIdAndOwner(id: string, ownerId: string) {
    return this.model.findOne({ _id: id, ownerId }).exec();
  }

  findAllByOwner(ownerId: string) {
    return this.model.find({ ownerId }).sort({ createdAt: -1 }).exec();
  }

  setImage(id: string, imageKey: string, imageMime: string) {
    return this.model
      .findByIdAndUpdate(id, { imageKey, imageMime }, { new: true })
      .exec();
  }

  // guarded переход в processing. Пускаем и pending (первый заход), и processing
  startProcessing(id: string) {
    return this.model
      .findOneAndUpdate(
        { _id: id, status: { $in: ['pending', 'processing'] } },
        { status: 'processing' },
        { new: true },
      )
      .exec();
  }

  setReady(id: string, draft: RecognitionDraft) {
    return this.model
      .findByIdAndUpdate(
        id,
        { status: 'ready', draft, completedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  setFailed(id: string, error: string) {
    return this.model
      .findByIdAndUpdate(
        id,
        { status: 'failed', error, completedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  cancel(id: string, ownerId: string) {
    return this.model
      .findOneAndUpdate(
        { _id: id, ownerId, status: { $in: ['pending', 'processing'] } },
        { status: 'cancelled', completedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}
