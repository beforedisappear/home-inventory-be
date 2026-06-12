import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { CUSTOM_FIELDS_MAX } from '../constants/custom-field';
import { CustomFieldDto } from './custom-field.dto';

export class CreateItemDto {
  @IsMongoId()
  containerId: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(CUSTOM_FIELDS_MAX)
  @ArrayUnique((f: CustomFieldDto) => f.key, {
    message: 'customFields must not contain duplicate keys',
  })
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields?: CustomFieldDto[];
}
