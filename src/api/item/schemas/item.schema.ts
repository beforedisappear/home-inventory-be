import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

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

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 256 })
  name: string;

  @Prop({ default: 1, min: 1 })
  quantity: number;

  @Prop({ trim: true, maxlength: 2048 })
  description?: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

ItemSchema.index({ ownerId: 1, containerId: 1 });
