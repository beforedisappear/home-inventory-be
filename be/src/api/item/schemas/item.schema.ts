import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

import { QR_STATUSES, type QrStatus } from '../interfaces/qr.types';
import { ItemPhoto, ItemPhotoSchema } from './item-photo.schema';

export type ItemDocument = TimestampedDocument<Item>;

@Schema({ timestamps: true })
export class Item {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  // index — для запроса "что внутри контейнера X"
  @Prop({
    type: Types.ObjectId,
    ref: 'Container',
    required: true,
    index: true,
  })
  containerId: Types.ObjectId;

  // index — для фильтрации items по категории и cascade unset при удалении категории
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true,
  })
  categoryId: Types.ObjectId | null;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 256 })
  name: string;

  @Prop({ default: 1, min: 1 })
  quantity: number;

  @Prop({ trim: true, maxlength: 2048 })
  description?: string;

  // wrapper-subdocs со ссылками на File. Порядок сохраняется (как добавили).
  @Prop({ type: [ItemPhotoSchema], default: [] })
  photos: ItemPhoto[];

  @Prop({ type: String, enum: QR_STATUSES, default: 'none' })
  qrStatus: QrStatus;

  @Prop({ type: String, default: null })
  qrKey: string | null;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

ItemSchema.index({ ownerId: 1, containerId: 1 });
