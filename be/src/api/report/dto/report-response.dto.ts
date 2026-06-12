import {
  IsDate,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  REPORT_STATUSES,
  type ReportStatus,
} from '../interfaces/report-status.types';

export class ReportResponseDto {
  @IsMongoId()
  id: string;

  @IsIn(REPORT_STATUSES)
  status: ReportStatus;

  @IsMongoId()
  containerId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  itemCount: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize: number | null;

  // presigned URL для скачивания PDF; присутствует только при status='ready'
  @IsOptional()
  @IsString()
  downloadUrl: string | null;

  @IsOptional()
  @IsString()
  error: string | null;

  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  completedAt: Date | null;
}
