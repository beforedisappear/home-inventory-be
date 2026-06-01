import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InfraModule } from './infra/infra.module';
import { LibsModule } from './libs/libs.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    InfraModule,
    LibsModule,
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
