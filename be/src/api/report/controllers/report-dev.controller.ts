import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Authorized } from '@/shared/decorators';

import { ReportCleanupService } from '../services/report-cleanup.service';

@ApiTags('Reports [dev]')
@Authorized()
@Controller('reports/dev')
export class ReportDevController {
  constructor(private readonly cleanup: ReportCleanupService) {}

  @ApiOperation({ summary: 'Запустить report-cleanup cron вручную' })
  @Post('cleanup/run')
  async runCleanup() {
    await this.cleanup.runDaily();

    return { ok: true };
  }
}
