import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

import { DOCUMENT_TYPES } from '../constants/document';
import type { DocumentType } from '../interfaces/document.types';

export type DocumentDocument = TimestampedDocument<DocumentEntity>;

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  // index — основной паттерн запроса: документы конкретной вещи
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true, index: true })
  itemId: Types.ObjectId;

  @Prop({ type: String, enum: DOCUMENT_TYPES, required: true })
  type: DocumentType;

  @Prop({ trim: true, maxlength: 256 })
  name?: string;

  @Prop({ trim: true, maxlength: 2048 })
  description?: string;

  // index — под будущий cron Reminders (поиск истекающих гарантий)
  @Prop({ type: Date, default: null, index: true })
  warrantyEndsAt: Date | null;

  @Prop({ required: true })
  fileKey: string;

  @Prop({ required: true })
  fileMime: string;

  @Prop({ required: true })
  fileSize: number;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);

DocumentSchema.index({ ownerId: 1, itemId: 1 });
DocumentSchema.index({ ownerId: 1, warrantyEndsAt: 1 });
