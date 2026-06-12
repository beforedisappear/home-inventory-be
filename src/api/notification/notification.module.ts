// подгружаем .env до top-level чтения process.env.ENABLE_DEV_ENDPOINTS ниже
import 'dotenv/config';

import { Module, Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DocumentModule } from '@/api/document/document.module';
import { ItemModule } from '@/api/item/item.module';
import { UserModule } from '@/api/user/user.module';
import { LibsModule } from '@/libs/libs.module';

import { NotificationDevController } from './controllers/notification-dev.controller';
import { NotificationRepository } from './repositories/notification.repository';
import {
  NotificationLog,
  NotificationLogSchema,
} from './schemas/notification.schema';
import { NotificationService } from './services/notification.service';
import { WarrantyReminderService } from './services/warranty-reminder.service';

const devControllers: Type[] =
  process.env.ENABLE_DEV_ENDPOINTS === 'true'
    ? [NotificationDevController]
    : [];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
    LibsModule,
    DocumentModule,
    ItemModule,
    UserModule,
  ],
  controllers: [...devControllers],
  providers: [
    NotificationService,
    NotificationRepository,
    WarrantyReminderService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
