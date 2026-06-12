import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Home Inventory API')
    .setDescription('API для приложения домашней инвентаризации')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}
