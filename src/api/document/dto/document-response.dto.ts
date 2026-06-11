import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { DOCUMENT_TYPES } from '../constants/document';
import type { DocumentType } from '../interfaces/document.types';
import { DocumentFileResponseDto } from './document-file-response.dto';

export class DocumentResponseDto {
  @IsMongoId()
  id: string;

  @IsMongoId()
  itemId: string;

  @IsIn(DOCUMENT_TYPES)
  type: DocumentType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  warrantyEndsAt: Date | null;

  @ValidateNested()
  @Type(() => DocumentFileResponseDto)
  file: DocumentFileResponseDto;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
