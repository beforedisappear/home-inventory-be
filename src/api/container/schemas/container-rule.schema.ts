import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

import { KindRule, KindRuleSchema } from './kind-rule.schema';

export type ContainerRuleDocument = TimestampedDocument<ContainerRule>;

/**
 *  Правило размещения — переиспользуемый набор ограничений по kind'ам.
 *  Один юзер может иметь несколько правил (библиотека правил),
 *  и привязывать их к разным контейнерам через Container.rule.
 */
@Schema({ timestamps: true })
export class ContainerRule {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 128 })
  name: string;

  @Prop({ type: [KindRuleSchema], default: [] })
  kindRules: KindRule[];
}

export const ContainerRuleSchema = SchemaFactory.createForClass(ContainerRule);

// привязыаем правила к юзеру и делаем их имена уникальными
ContainerRuleSchema.index({ owner: 1, name: 1 }, { unique: true });
