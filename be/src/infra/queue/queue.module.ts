import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';

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
