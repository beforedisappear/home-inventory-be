import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';

import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    LibsModule,
    InfraModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
