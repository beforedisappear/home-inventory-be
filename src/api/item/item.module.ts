import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

import { CategoryModule } from '@/api/category/category.module';
import { ContainerModule } from '@/api/container/container.module';
import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';

import { ITEM_PHOTO_QUEUE } from './constants/item-photo-queue';
import { ItemController } from './controllers/item.controller';
import { ItemPhotoCompressProcessor } from './processors/item-photo-compress.processor';
import { ItemRepository } from './repositories/item.repository';
import { Item, ItemSchema } from './schemas/item.schema';
import { ItemPhotoService } from './services/item-photo.service';
import { ItemService } from './services/item.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
    InfraModule,
    LibsModule,
    forwardRef(() => ContainerModule),
    forwardRef(() => CategoryModule),
    BullModule.registerQueue({ name: ITEM_PHOTO_QUEUE }),
    BullBoardModule.forFeature({
      name: ITEM_PHOTO_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    ItemPhotoService,
    ItemRepository,
    ItemPhotoCompressProcessor,
  ],
  exports: [ItemService],
})
export class ItemModule {}
