import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ItemModule } from '@/api/item/item.module';
import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';

import { DocumentController } from './controllers/document.controller';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentEntity, DocumentSchema } from './schemas/document.schema';
import { DocumentFileService } from './services/document-file.service';
import { DocumentService } from './services/document.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    LibsModule,
    InfraModule,
    forwardRef(() => ItemModule),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentFileService, DocumentRepository],
  exports: [DocumentService],
})
export class DocumentModule {}
