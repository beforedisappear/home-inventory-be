import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { SchemaTypes } from 'mongoose';

import { CUSTOM_FIELD_KEY_MAX } from '../constants/custom-field';
import {
  CUSTOM_FIELD_TYPES,
  type CustomFieldType,
  type CustomFieldValue,
} from '../interfaces/custom-field.types';

@Schema({ _id: false })
export class CustomField {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: CUSTOM_FIELD_KEY_MAX,
  })
  key: string;

  @Prop({ type: String, enum: CUSTOM_FIELD_TYPES, required: true })
  type: CustomFieldType;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  value: CustomFieldValue;
}

export const CustomFieldSchema = SchemaFactory.createForClass(CustomField);
