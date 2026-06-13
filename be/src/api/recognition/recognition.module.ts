import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

import { CategoryModule } from '@/api/category/category.module';
import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';

import { RECOGNITION_QUEUE } from './constants/recognition-queue';
import { RecognitionController } from './controllers/recognition.controller';
import { RecognitionRecognizeProcessor } from './processors/recognition-recognize.processor';
import { RecognitionRepository } from './repositories/recognition.repository';
import { Recognition, RecognitionSchema } from './schemas/recognition.schema';
import { RecognitionEventsService } from './services/recognition-events.service';
import { RecognitionImageService } from './services/recognition-image.service';
import { RecognitionService } from './services/recognition.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recognition.name, schema: RecognitionSchema },
    ]),
    InfraModule,
    LibsModule,
    CategoryModule,
    BullModule.registerQueue({ name: RECOGNITION_QUEUE }),
    BullBoardModule.forFeature({
      name: RECOGNITION_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [RecognitionController],
  providers: [
    RecognitionService,
    RecognitionRepository,
    RecognitionRecognizeProcessor,
    RecognitionEventsService,
    RecognitionImageService,
  ],
})
export class RecognitionModule {}
