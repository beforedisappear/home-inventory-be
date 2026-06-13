import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  RECOGNITION_STATUSES,
  type RecognitionStatus,
} from '../interfaces/recognition-status.types';
import { RecognitionDraftDto } from './recognition-draft.dto';

export class RecognitionResponseDto {
  @IsMongoId()
  id: string;

  @IsIn(RECOGNITION_STATUSES)
  status: RecognitionStatus;

  // черновик присутствует только при status='ready'
  @IsOptional()
  @ValidateNested()
  @Type(() => RecognitionDraftDto)
  draft: RecognitionDraftDto | null;

  @IsOptional()
  @IsString()
  error: string | null;

  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  completedAt: Date | null;
}
