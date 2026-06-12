import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { NotificationLogData } from '../interfaces/notification-log-data.interface';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../schemas/notification.schema';

const MONGO_DUPLICATE_KEY_CODE = 11000;

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(NotificationLog.name)
    private readonly model: Model<NotificationLogDocument>,
  ) {}

  // null — запись уже существовала, иначе — только что вставлена
  async tryInsert(data: NotificationLogData) {
    try {
      return await this.model.create(data);
    } catch (err) {
      if ((err as { code?: number })?.code === MONGO_DUPLICATE_KEY_CODE) {
        return null;
      }

      throw err;
    }
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
