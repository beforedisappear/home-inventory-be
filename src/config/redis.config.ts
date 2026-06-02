import type { ConfigService } from '@nestjs/config';
import type { RedisModuleOptions } from '@nestjs-modules/ioredis';

export function getRedisConfig(
  configService: ConfigService,
): RedisModuleOptions {
  const host = configService.getOrThrow<string>('REDIS_HOST');
  const port = configService.getOrThrow<string>('REDIS_PORT');

  return { type: 'single', url: `redis://${host}:${port}` };
}
