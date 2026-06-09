import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 *  Subdoc фото внутри Item. Метадата хранится прямо здесь — отдельной File-коллекции нет.
 *  url не храним: вычисляется через StorageService.buildUrl(key) на момент response.
 */
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
