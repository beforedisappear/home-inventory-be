import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

import { RECOGNITION_TTL_SEC } from '../constants/recognition';
import {
  RECOGNITION_STATUSES,
  type RecognitionStatus,
} from '../interfaces/recognition-status.types';
import {
  RecognitionDraft,
  RecognitionDraftSchema,
} from './recognition-draft.schema';

export type RecognitionDocument = TimestampedDocument<Recognition>;

@Schema({ timestamps: true })
export class Recognition {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: RECOGNITION_STATUSES,
    default: 'pending',
    index: true,
  })
  status: RecognitionStatus;

  @Prop({ type: String, default: null })
  imageKey: string | null;

  @Prop({ type: String, default: null })
  imageMime: string | null;

  @Prop({ type: RecognitionDraftSchema, default: null })
  draft: RecognitionDraft | null;

  @Prop({ type: String, default: null })
  error: string | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;
}

export const RecognitionSchema = SchemaFactory.createForClass(Recognition);

// есть ли активное распознавание у юзера + история по свежести
RecognitionSchema.index({ ownerId: 1, status: 1 });
RecognitionSchema.index({ ownerId: 1, createdAt: -1 });

// TTL: черновики эфемерны — Mongo сам сносит документы спустя сутки
RecognitionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: RECOGNITION_TTL_SEC },
);
