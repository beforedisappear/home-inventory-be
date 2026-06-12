import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
  REPORT_ACTIVE_STATUSES,
  type ReportStatus,
} from '../interfaces/report-status.types';
import { Report, ReportDocument } from '../schemas/report.schema';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectModel(Report.name)
    private readonly model: Model<ReportDocument>,
  ) {}

  create(ownerId: string, containerId: string) {
    return this.model.create({ ownerId, containerId });
  }

  findByIdAndOwner(id: string, ownerId: string) {
    return this.model.findOne({ _id: id, ownerId }).exec();
  }

  findAllByOwner(ownerId: string) {
    return this.model.find({ ownerId }).sort({ createdAt: -1 }).exec();
  }

  hasActive(ownerId: string) {
    return this.model
      .exists({ ownerId, status: { $in: REPORT_ACTIVE_STATUSES } })
      .exec();
  }

  setStatus(id: string, status: ReportStatus) {
    return this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  setReady(id: string, fileKey: string, fileSize: number, itemCount: number) {
    return this.model
      .findByIdAndUpdate(
        id,
        {
          status: 'ready',
          fileKey,
          fileSize,
          itemCount,
          completedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  setFailed(id: string, error: string) {
    return this.model
      .findByIdAndUpdate(
        id,
        { status: 'failed', error, completedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  // стриминг ready-отчётов старше cutoff — для cleanup-крона.
  // .lean() + cursor: в RAM держим максимум один батч, а не весь массив.
  streamReadyOlderThan(cutoff: Date) {
    return this.model
      .find({ status: 'ready', createdAt: { $lt: cutoff } })
      .lean()
      .cursor({ batchSize: 100 });
  }

  // bulk-удаление тех же записей — один запрос вместо N round-trip'ов
  deleteReadyOlderThan(cutoff: Date) {
    return this.model
      .deleteMany({ status: 'ready', createdAt: { $lt: cutoff } })
      .exec();
  }
}
