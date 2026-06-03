import type { ConfigService } from '@nestjs/config';
import type { BullRootModuleOptions } from '@nestjs/bullmq';

export function getBullConfig(
  configService: ConfigService,
): BullRootModuleOptions {
  return {
    connection: {
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
    },
  };
}
