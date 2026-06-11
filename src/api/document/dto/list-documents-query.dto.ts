import { IsIn, IsMongoId, IsOptional } from 'class-validator';

import { DOCUMENT_TYPES } from '../constants/document';
import type { DocumentType } from '../interfaces/document.types';

export class ListDocumentsQueryDto {
  @IsOptional()
  @IsMongoId()
  itemId?: string;

  @IsOptional()
  @IsIn(DOCUMENT_TYPES)
  type?: DocumentType;
}
