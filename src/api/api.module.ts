import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

/**
 *  Модуль - агрегатор фичевых модулей (бизнес-логика, controllers + services)
 */
@Module({
  controllers: [],
  imports: [AuthModule, UserModule],
  providers: [],
})
export class ApiModule {}
