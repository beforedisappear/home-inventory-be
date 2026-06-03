import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { getBullConfig } from '@/config';
import { QUEUES_ROUTE } from '@/shared/constants/routes';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getBullConfig,
    }),
    BullBoardModule.forRoot({
      route: QUEUES_ROUTE,
      adapter: ExpressAdapter,
    }),
  ],
  exports: [BullModule, BullBoardModule],
})
export class QueueModule {}
