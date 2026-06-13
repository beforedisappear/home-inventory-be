import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

import {
  CustomField,
  CustomFieldSchema,
} from '@/api/item/schemas/custom-field.schema';

// черновик вещи, распознанный моделью. Той же формы, что поля Item,
// чтобы фронт мог напрямую переложить его в форму создания.
@Schema({ _id: false })
export class RecognitionDraft {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, default: null })
  description: string | null;

  // best-effort матч предложенной моделью категории к существующей
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  categoryId: Types.ObjectId | null;

  // сырое имя категории от модели (на случай если матч не сошёлся)
  @Prop({ type: String, default: null })
  categoryName: string | null;

  @Prop({ type: [CustomFieldSchema], default: [] })
  customFields: CustomField[];
}

export const RecognitionDraftSchema =
  SchemaFactory.createForClass(RecognitionDraft);
