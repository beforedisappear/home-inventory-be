import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

import { Job } from 'bullmq';

import { ItemService } from '@/api/item/services/item.service';
import { StorageService } from '@/libs/storage/storage.service';

import { REPORT_MIME } from '../constants/report';
import { REPORT_GENERATE_JOB, REPORT_QUEUE } from '../constants/report-queue';
import { reportStorageKey } from '../constants/storage-keys';
import { type ReportGenerateJobData } from '../interfaces/report-generate.interface';
import { ReportRepository } from '../repositories/report.repository';
import { renderItemsPdf } from '../utils/render-items-pdf';

@Processor(REPORT_QUEUE)
export class ReportGenerateProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportGenerateProcessor.name);

  constructor(
    private readonly repo: ReportRepository,
    private readonly storage: StorageService,
    private readonly itemService: ItemService,
  ) {
    super();
  }

  async process(job: Job<ReportGenerateJobData>) {
    if (job.name !== REPORT_GENERATE_JOB) {
      this.logger.warn(`unknown job name: ${job.name}`);
      return;
    }

    const { reportId, ownerId } = job.data;

    const report = await this.repo.findByIdAndOwner(reportId, ownerId);

    if (!report) {
      this.logger.warn(`report ${reportId} not found, skipping`);
      return;
    }

    await this.repo.setStatus(reportId, 'processing');

    const containerId = report.containerId.toString();

    const items = await this.itemService.findRawByFilters(ownerId, {
      containerId,
    });

    const pdf = await renderItemsPdf({
      items,
      containerId,
      generatedAt: new Date(),
      fetchPhoto: (key) =>
        this.storage.get(key).catch((err) => {
          const msg = `failed to fetch photo ${key}: ${String(err)}`;

          this.logger.warn(msg);

          return null;
        }),
    });

    const key = reportStorageKey(ownerId, reportId);

    await this.storage.uploadBuffer(key, pdf, REPORT_MIME);

    await this.repo.setReady(reportId, key, pdf.length, items.length);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ReportGenerateJobData>, err: Error) {
    const msg = `report ${job.data?.reportId} failed: ${err.message}`;

    this.logger.error(msg, err.stack);

    if (job.data?.reportId) {
      await this.repo
        .setFailed(job.data.reportId, err.message)
        .catch(() => undefined);
    }
  }
}
