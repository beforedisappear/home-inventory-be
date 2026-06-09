import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ContainerModule } from './container/container.module';
import { ItemModule } from './item/item.module';
import { UserModule } from './user/user.module';

/**
 *  Модуль - агрегатор фичевых модулей (бизнес-логика, controllers + services)
 */
@Module({
  controllers: [],
  imports: [AuthModule, UserModule, ContainerModule, ItemModule],
  providers: [],
})
export class ApiModule {}
