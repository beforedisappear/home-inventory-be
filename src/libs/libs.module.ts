import { Module } from '@nestjs/common';

import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';

/**
 *  Модуль - агрегатор внутренних сервисов-обёрток над внешними решениями
 */
@Module({
  imports: [StorageModule, MailModule],
  exports: [StorageModule, MailModule],
})
export class LibsModule {}
