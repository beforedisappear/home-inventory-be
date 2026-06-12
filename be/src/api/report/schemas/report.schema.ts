import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

import type { TimestampedDocument } from '@/shared/types/mongo';

import {
  REPORT_STATUSES,
  type ReportStatus,
} from '../interfaces/report-status.types';

export type ReportDocument = TimestampedDocument<Report>;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: REPORT_STATUSES,
    default: 'pending',
    index: true,
  })
  status: ReportStatus;

  // контейнер, по которому строится отчёт
  @Prop({ type: Types.ObjectId, ref: 'Container', required: true })
  containerId: Types.ObjectId;

  // итоговое число items в отчёте (после фактического рендера)
  @Prop({ type: Number, default: null })
  itemCount: number | null;

  // S3-ключ готового PDF
  @Prop({ type: String, default: null })
  fileKey: string | null;

  // размер готового PDF в байтах
  @Prop({ type: Number, default: null })
  fileSize: number | null;

  // текст ошибки если status='failed'
  @Prop({ type: String, default: null })
  error: string | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// быстрый запрос "есть ли активный отчёт у юзера" + cleanup-крон по ready+createdAt
ReportSchema.index({ ownerId: 1, status: 1 });
ReportSchema.index({ ownerId: 1, createdAt: -1 });
