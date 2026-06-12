import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ItemPhoto {
  // путь файла в S3-бакете
  @Prop({ required: true })
  key: string;

  // image/jpeg, application/pdf и т.п.
  @Prop({ required: true })
  mimeType: string;

  // размер в байтах
  @Prop({ required: true })
  size: number;
}

export const ItemPhotoSchema = SchemaFactory.createForClass(ItemPhoto);
