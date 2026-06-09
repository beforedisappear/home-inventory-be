import { forwardRef, Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';
import { ContainerModule } from '@/api/container/container.module';
import { ItemController } from './controllers/item.controller';
import { ItemService } from './services/item.service';
import { ItemRepository } from './repositories/item.repository';

import { Item, ItemSchema } from './schemas/item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
    InfraModule,
    LibsModule,
    forwardRef(() => ContainerModule),
  ],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository],
  exports: [ItemService],
})
export class ItemModule {}
