import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { getWinstonConfig } from '@/config';

@Global()
@Module({
  imports: [WinstonModule.forRoot(getWinstonConfig())],
  exports: [WinstonModule],
})
export class LoggerModule {}
