import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CONTAINER_KIND, type ContainerKind } from './container.schema';

/**
 *  Правило для одного kind контейнера: куда его можно класть.
 *  Хранится как subdocument внутри ContainerRule, отдельный _id не нужен
 */
@Schema({ _id: false })
export class KindRule {
  @Prop({ type: String, enum: CONTAINER_KIND, required: true })
  kind: ContainerKind;

  // можно ли класть прямо в root-контейнер (квартиру), без промежуточных уровней
  @Prop({ default: true })
  canBeInsideRoot: boolean;

  @Prop({ type: [{ type: String, enum: CONTAINER_KIND }], default: [] })
  allowedParents: ContainerKind[];
}

export const KindRuleSchema = SchemaFactory.createForClass(KindRule);
