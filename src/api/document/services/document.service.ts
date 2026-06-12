import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ItemService } from '@/api/item/services/item.service';
import { StorageService } from '@/libs/storage/storage.service';

import { CreateDocumentDto } from '../dto/create-document.dto';
import { ListDocumentsQueryDto } from '../dto/list-documents-query.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import {
  CreateDocumentData,
  ExpiringWarranty,
  UpdateDocumentData,
} from '../interfaces';
import { DocumentMapper } from '../mappers/document.mapper';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentFileService } from './document-file.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly fileService: DocumentFileService,

    @Inject(forwardRef(() => ItemService))
    private readonly itemService: ItemService,
  ) {}

  async findAll(ownerId: string, query: ListDocumentsQueryDto) {
    // если фильтр по itemId — заодно проверяем что вещь существует и принадлежит user'у
    if (query.itemId) {
      await this.itemService.findById(ownerId, query.itemId);
    }

    const docs = await this.repo.findAll(ownerId, query);

    return docs.map((d) =>
      DocumentMapper.toResponseDto(d, this.storage.buildUrl),
    );
  }

  async findById(ownerId: string, id: string) {
    const doc = await this.repo.findByIdAndOwner(id, ownerId);

    if (!doc) throw new NotFoundException('Document not found');

    return DocumentMapper.toResponseDto(doc, this.storage.buildUrl);
  }

  async create(ownerId: string, dto: CreateDocumentDto) {
    // вещь существует и принадлежит user'у
    await this.itemService.findById(ownerId, dto.itemId);

    // ключ принадлежит user'у + берём mime/size из S3 HEAD (доверенный источник)
    const { mimeType, size } = await this.fileService.resolveKey(
      ownerId,
      dto.fileKey,
    );

    const payload: CreateDocumentData = {
      ownerId,
      itemId: dto.itemId,
      type: dto.type,
      name: dto.name,
      description: dto.description,
      warrantyEndsAt: dto.warrantyEndsAt ? new Date(dto.warrantyEndsAt) : null,
      fileKey: dto.fileKey,
      fileMime: mimeType,
      fileSize: size,
    };

    const created = await this.repo.create(payload);

    return DocumentMapper.toResponseDto(created, this.storage.buildUrl);
  }

  async update(ownerId: string, id: string, dto: UpdateDocumentDto) {
    const existing = await this.repo.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundException('Document not found');

    const payload: UpdateDocumentData = {
      type: dto.type,
      name: dto.name,
      description: dto.description,
    };

    if (dto.warrantyEndsAt !== undefined) {
      payload.warrantyEndsAt = dto.warrantyEndsAt
        ? new Date(dto.warrantyEndsAt)
        : null;
    }

    const updated = await this.repo.update(id, payload);

    return DocumentMapper.toResponseDto(updated!, this.storage.buildUrl);
  }

  async delete(ownerId: string, id: string) {
    const existing = await this.repo.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundException('Document not found');

    await this.fileService.deleteIfExists(existing.fileKey);
    await this.repo.delete(id);

    return { id };
  }

  // вызывается из ItemService.delete для каскадной очистки документов вещи
  async deleteAllByItem(itemId: string) {
    const docs = await this.repo.findAllByItem(itemId);

    if (docs.length === 0) return;

    await this.fileService.deleteMany(docs.map((d) => d.fileKey));
    await this.repo.deleteByItem(itemId);
  }

  // стриминг для cron-задач: без DTO/маппинга, без owner-фильтра.
  // async generator — массив не накапливается; при throw/break cursor закрывается автоматически.
  async *streamExpiringWarranties(
    from: Date,
    to: Date,
  ): AsyncIterable<ExpiringWarranty> {
    const cursor = this.repo.streamExpiringInWindow(from, to);

    for await (const doc of cursor) {
      yield {
        documentId: doc._id.toString(),
        type: doc.type,
        itemId: doc.itemId.toString(),
        ownerId: doc.ownerId.toString(),
        warrantyEndsAt: doc.warrantyEndsAt!,
      };
    }
  }
}
