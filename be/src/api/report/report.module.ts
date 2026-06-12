// подгружаем .env до top-level чтения process.env.ENABLE_DEV_ENDPOINTS ниже
import 'dotenv/config';

import { BullModule } from '@nestjs/bullmq';
import { Module, Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

import { ItemModule } from '@/api/item/item.module';
import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';

import { REPORT_QUEUE } from './constants/report-queue';
import { ReportDevController } from './controllers/report-dev.controller';
import { ReportController } from './controllers/report.controller';
import { ReportGenerateProcessor } from './processors/report-generate.processor';
import { ReportRepository } from './repositories/report.repository';
import { Report, ReportSchema } from './schemas/report.schema';
import { ReportCleanupService } from './services/report-cleanup.service';
import { ReportService } from './services/report.service';

const devControllers: Type[] =
  process.env.ENABLE_DEV_ENDPOINTS === 'true' ? [ReportDevController] : [];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    InfraModule,
    LibsModule,
    ItemModule,
    BullModule.registerQueue({ name: REPORT_QUEUE }),
    BullBoardModule.forFeature({ name: REPORT_QUEUE, adapter: BullMQAdapter }),
  ],
  controllers: [ReportController, ...devControllers],
  providers: [
    ReportService,
    ReportRepository,
    ReportGenerateProcessor,
    ReportCleanupService,
  ],
})
export class ReportModule {}
