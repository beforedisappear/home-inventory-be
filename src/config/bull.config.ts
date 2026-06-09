import type { BullRootModuleOptions } from '@nestjs/bullmq';
import type { ConfigService } from '@nestjs/config';

export function getBullConfig(
  configService: ConfigService,
): BullRootModuleOptions {
  return {
    connection: {
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
    },

    defaultJobOptions: {
      // 3 попытки с экспоненциальным бекоффом: 5s → 25s → 125s
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },

      // успешные снимаем — не засоряем Redis
      removeOnComplete: true,

      // последние 100 фейлов держим для дебага
      removeOnFail: 100,
    },
  };
}
