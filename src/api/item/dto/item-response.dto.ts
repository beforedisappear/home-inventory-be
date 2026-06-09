import {
  IsArray,
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ItemPhotoResponseDto } from './item-photo-response.dto';

export class ItemResponseDto {
  @IsMongoId()
  id: string;

  @IsMongoId()
  containerId: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  description?: string;

  // Фото, прикрученные к вещи. Порядок — как заливали.
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPhotoResponseDto)
  photos: ItemPhotoResponseDto[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
