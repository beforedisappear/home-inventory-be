import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Queue } from 'bullmq';

import { ItemService } from '@/api/item/services/item.service';
import { StorageService } from '@/libs/storage/storage.service';

import {
  REPORT_DOWNLOAD_URL_TTL_SEC,
  REPORT_ITEMS_HARD_CAP,
} from '../constants/report';
import { REPORT_GENERATE_JOB, REPORT_QUEUE } from '../constants/report-queue';
import { CreateReportDto } from '../dto/create-report.dto';
import { type ReportGenerateJobData } from '../interfaces/report-generate.interface';
import { ReportMapper } from '../mappers/report.mapper';
import { ReportRepository } from '../repositories/report.repository';

@Injectable()
export class ReportService {
  constructor(
    private readonly repo: ReportRepository,
    private readonly itemService: ItemService,
    private readonly storage: StorageService,

    @InjectQueue(REPORT_QUEUE)
    private readonly queue: Queue<ReportGenerateJobData>,
  ) {}

  async create(ownerId: string, dto: CreateReportDto) {
    const active = await this.repo.hasActive(ownerId);

    if (active)
      throw new ConflictException('Active report already in progress');

    const count = await this.itemService.countByFilters(ownerId, {
      containerId: dto.containerId,
    });

    if (count > REPORT_ITEMS_HARD_CAP)
      throw new BadRequestException(
        `Report would include ${count} items, max is ${REPORT_ITEMS_HARD_CAP}. Narrow your filters.`,
      );

    const created = await this.repo.create(ownerId, dto.containerId);

    await this.queue.add(REPORT_GENERATE_JOB, {
      reportId: created._id.toString(),
      ownerId,
    });

    return ReportMapper.toResponseDto(created, null);
  }

  async findById(ownerId: string, id: string) {
    const report = await this.repo.findByIdAndOwner(id, ownerId);

    if (!report) throw new NotFoundException('Report not found');

    const downloadUrl = await this.resolveDownloadUrl(
      report.status,
      report.fileKey,
    );

    return ReportMapper.toResponseDto(report, downloadUrl);
  }

  async findAll(ownerId: string) {
    const reports = await this.repo.findAllByOwner(ownerId);

    return reports.map((r) => ReportMapper.toResponseDto(r, null));
  }

  async delete(ownerId: string, id: string) {
    const report = await this.repo.findByIdAndOwner(id, ownerId);

    if (!report) throw new NotFoundException('Report not found');

    if (report.fileKey)
      await this.storage.delete(report.fileKey).catch(() => undefined);

    await this.repo.delete(id);

    return { id };
  }

  private resolveDownloadUrl(status: string, fileKey: string | null) {
    if (status !== 'ready' || !fileKey) return Promise.resolve(null);

    return this.storage.getSignedDownloadUrl(
      fileKey,
      REPORT_DOWNLOAD_URL_TTL_SEC,
    );
  }
}
