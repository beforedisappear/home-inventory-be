import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ContainerModule } from './container/container.module';
import { DocumentModule } from './document/document.module';
import { ItemModule } from './item/item.module';
import { NotificationModule } from './notification/notification.module';
import { RecognitionModule } from './recognition/recognition.module';
import { ReportModule } from './report/report.module';
import { UserModule } from './user/user.module';

/**
 *  Модуль - агрегатор фичевых модулей (бизнес-логика, controllers + services)
 */
@Module({
  controllers: [],
  imports: [
    AuthModule,
    UserModule,
    ContainerModule,
    ItemModule,
    CategoryModule,
    DocumentModule,
    NotificationModule,
    ReportModule,
    RecognitionModule,
  ],
  providers: [],
})
export class ApiModule {}
