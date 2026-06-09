import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';
import { ContainerModule } from '@/api/container/container.module';
import { ItemController } from './controllers/item.controller';
import { ItemService } from './services/item.service';
import { ItemPhotoService } from './services/item-photo.service';
import { ItemRepository } from './repositories/item.repository';
import { ItemPhotoCompressProcessor } from './processors/item-photo-compress.processor';

import { Item, ItemSchema } from './schemas/item.schema';
import { ITEM_PHOTO_QUEUE } from './constants/item-photo-queue';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
    InfraModule,
    LibsModule,
    forwardRef(() => ContainerModule),

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
