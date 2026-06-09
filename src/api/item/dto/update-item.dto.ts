import { PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateItemDto } from './create-item.dto';
import { ItemPhotoDto } from './item-photo.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPhotoDto)
  photos?: ItemPhotoDto[];
}
