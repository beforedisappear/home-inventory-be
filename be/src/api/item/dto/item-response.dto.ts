import { Type } from 'class-transformer';
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

import { CustomFieldDto } from './custom-field.dto';
import { ItemPhotoResponseDto } from './item-photo-response.dto';

export class ItemResponseDto {
  @IsMongoId()
  id: string;

  @IsMongoId()
  containerId: string;

  @IsOptional()
  @IsMongoId()
  categoryId: string | null;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields: CustomFieldDto[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
