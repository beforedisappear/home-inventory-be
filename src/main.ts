import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import {
  getCorsConfig,
  getValidationPipeConfig,
} from '@/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.setGlobalPrefix('api');

  app.enableCors(getCorsConfig(configService));

  const port = configService.getOrThrow<number>('API_PORT');

  await app.listen(port);
}

void bootstrap().catch((error: unknown) => {
  console.error('Bootstrap failed', error);
  process.exit(1);
});
