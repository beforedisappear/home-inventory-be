import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

import { getRedisConfig } from '@/config';

import { RedisService } from './redis.service';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRedisConfig,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
