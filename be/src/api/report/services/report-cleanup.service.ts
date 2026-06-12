import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { StorageService } from '@/libs/storage/storage.service';

import { REPORT_TTL_DAYS } from '../constants/report';
import { ReportRepository } from '../repositories/report.repository';

@Injectable()
export class ReportCleanupService {
  private readonly logger = new Logger(ReportCleanupService.name);

  constructor(
    private readonly repo: ReportRepository,
    private readonly storage: StorageService,
  ) {}

  // 4:00 UTC ежедневно — разводим по времени с warranty-reminder
  @Cron('0 4 * * *', { timeZone: 'UTC' })
  async runDaily() {
    const cutoff = new Date(Date.now() - REPORT_TTL_DAYS * 24 * 60 * 60 * 1000);

    // стримим курсором — S3-объекты удаляем по одному (bulk-by-query S3 не умеет),
    // в RAM держим максимум один батч, а не весь массив stale-отчётов.
    const cursor = this.repo.streamReadyOlderThan(cutoff);

    let seen = 0;

    for await (const report of cursor) {
      if (report.fileKey) {
        await this.storage.delete(report.fileKey).catch((err) => {
          this.logger.warn(
            `failed to delete S3 ${report.fileKey}: ${String(err)}`,
          );
        });
      }

      seen += 1;
    }

    if (seen === 0) {
      this.logger.log('no stale reports to clean up');
      return;
    }

    // Mongo-записи сносим одним запросом, а не N round-trip'ов
    const { deletedCount } = await this.repo.deleteReadyOlderThan(cutoff);

    this.logger.log(`report cleanup: removed ${deletedCount} report(s)`);
  }
}
