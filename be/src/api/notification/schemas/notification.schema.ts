import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from '../interfaces/notification.types';

export type NotificationLogDocument = TimestampedDocument<NotificationLog>;

@Schema({ timestamps: true, collection: 'notification_log' })
export class NotificationLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: NOTIFICATION_TYPES, required: true })
  type: NotificationType;

  @Prop({ type: Types.ObjectId, required: true })
  relatedId: Types.ObjectId;

  // числовой "порог" для time-based уведомлений (warranty: 30/7/1).
  // часть unique-ключа — позволяет слать разные пороги одного события.
  @Prop({ type: Number, required: true })
  threshold: number;

  @Prop({ type: Date, default: Date.now })
  sentAt: Date;
}

export const NotificationLogSchema =
  SchemaFactory.createForClass(NotificationLog);

NotificationLogSchema.index(
  { userId: 1, type: 1, relatedId: 1, threshold: 1 },
  { unique: true },
);
