import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';

/**
 *  Модуль - агрегатор низкоуровневой инфраструктуры
 */
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    QueueModule,
    LoggerModule,
    ScheduleModule.forRoot(),
  ],
  exports: [DatabaseModule, RedisModule, QueueModule],
})
export class InfraModule {}
