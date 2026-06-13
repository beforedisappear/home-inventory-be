import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AI_CLIENT } from './interfaces/ai-client.interface';
import { AiClientProvider } from './providers/ai-client.provider';

// Обёртка над AI-провайдером, экспортит порт AI_CLIENT
@Module({
  imports: [ConfigModule],
  providers: [AiClientProvider],
  exports: [AI_CLIENT],
})
export class AiModule {}
