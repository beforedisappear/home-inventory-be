import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { getCorsConfig, getValidationPipeConfig } from '@/config';
import { setupSwagger } from '@/shared/utils/swagger';
import { QUEUES_ROUTE } from '@/shared/constants/routes';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);

  // устанавливаем прокси для работы с nginx
  app.set('trust proxy', 1);

  // устанавливаем pipe для валидации запросов
  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));

  // устанавливаем версионирование по умолчанию
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // убираем префикс для определенных роутов
  app.setGlobalPrefix('api', { exclude: [QUEUES_ROUTE] });

  // конфигурируем CORS
  app.enableCors(getCorsConfig(configService));

  // конфигурируем документацию
  setupSwagger(app);

  const port = configService.getOrThrow<number>('API_PORT');

  await app.listen(port);
}

void bootstrap().catch((error: unknown) => {
  console.error('Bootstrap failed', error);
  process.exit(1);
});
