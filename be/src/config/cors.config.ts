import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { ConfigService } from '@nestjs/config';

export function getCorsConfig(configService: ConfigService): CorsOptions {
  return {
    origin: configService.getOrThrow<string>('ALLOWED_ORIGINS'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'language'],
  };
}
