import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'user@example.com' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Prop()
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
