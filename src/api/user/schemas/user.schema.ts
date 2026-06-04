import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

export type UserDocument = TimestampedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
