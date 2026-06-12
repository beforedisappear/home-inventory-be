import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(
  OmitType(CreateDocumentDto, ['itemId', 'fileKey'] as const),
) {}
