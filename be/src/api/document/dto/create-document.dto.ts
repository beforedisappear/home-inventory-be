import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { DOCUMENT_TYPES } from '../constants/document';
import type { DocumentType } from '../interfaces/document.types';

export class CreateDocumentDto {
  @IsMongoId()
  itemId: string;

  @IsIn(DOCUMENT_TYPES)
  type: DocumentType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  description?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  warrantyEndsAt?: string;

  @IsString()
  fileKey: string;
}
