import { Module } from '@nestjs/common';

import { MailModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';

/**
 *  Модуль - агрегатор внутренних сервисов-обёрток над внешними решениями (глобальный)
 */
@Module({
  imports: [StorageModule, MailModule],
  exports: [StorageModule, MailModule],
})
export class LibsModule {}
