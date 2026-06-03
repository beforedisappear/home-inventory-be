import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';

/**
 *  Модуль - агрегатор низкоуровневой инфраструктуры
 */
@Module({
  imports: [DatabaseModule, RedisModule, QueueModule],
  exports: [DatabaseModule, RedisModule, QueueModule],
})
export class InfraModule {}
