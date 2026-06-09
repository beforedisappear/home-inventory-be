import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

export type CategoryDocument = TimestampedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 128,
    unique: true,
  })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
