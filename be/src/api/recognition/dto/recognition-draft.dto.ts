import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CustomFieldDto } from '@/api/item/dto/custom-field.dto';

export class RecognitionDraftDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsOptional()
  @IsMongoId()
  categoryId: string | null;

  @IsOptional()
  @IsString()
  categoryName: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields: CustomFieldDto[];
}
