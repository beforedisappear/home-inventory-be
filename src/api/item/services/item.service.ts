import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ContainerService } from '@/api/container/services/container.service';
import { StorageService } from '@/libs/storage/storage.service';

import {
  ItemRepository,
  UpdateItemData,
} from '../repositories/item.repository';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ListItemsQueryDto } from '../dto/list-items-query.dto';
import { ItemPhotoResponseDto } from '../dto/item-photo-response.dto';
import { ItemMapper } from '../mappers/item.mapper';

@Injectable()
export class ItemService {
  constructor(
    private readonly repo: ItemRepository,
    private readonly storage: StorageService,

    @Inject(forwardRef(() => ContainerService))
    private readonly containerService: ContainerService,
  ) {}

  existsByContainer(containerId: string) {
    return this.repo.existsByContainer(containerId);
  }

  async findByContainer(ownerId: string, query: ListItemsQueryDto) {
    await this.containerService.findById(ownerId, query.containerId);

    const items = await this.repo.findByContainer(ownerId, query.containerId);

    return items.map((i) => ItemMapper.toResponseDto(i, this.storage.buildUrl));
  }

  async findById(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    return ItemMapper.toResponseDto(item, this.storage.buildUrl);
  }

  async create(ownerId: string, dto: CreateItemDto) {
    await this.containerService.findById(ownerId, dto.containerId);

    const created = await this.repo.create(ownerId, dto);

    return ItemMapper.toResponseDto(created, this.storage.buildUrl);
  }

  async update(ownerId: string, id: string, dto: UpdateItemDto) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);
    if (!item) throw new NotFoundException('Item not found');

    if (dto.containerId) {
      await this.containerService.findById(ownerId, dto.containerId);
    }

    const payload: UpdateItemData = {
      name: dto.name,
      quantity: dto.quantity,
      description: dto.description,
      containerId: dto.containerId,
    };

    // photos: атомарный replace. Если key исчез из нового массива — чистим S3.
    if (dto.photos !== undefined) {
      const oldKeys = item.photos.map((p) => p.key);

      const newKeys = dto.photos.map((p) => p.key);

      const removedKeys = oldKeys.filter((k) => !newKeys.includes(k));

      await this.deleteFromStorage(removedKeys);

      payload.photos = dto.photos;
    }

    const updated = await this.repo.update(id, payload);

    return ItemMapper.toResponseDto(updated!, this.storage.buildUrl);
  }

  async delete(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    // каскад: чистим S3 по всем key, потом сам Item
    await this.deleteFromStorage(item.photos.map((p) => p.key));

    await this.repo.delete(id);

    return { id };
  }

  /**
   *  Загрузка файла в S3. БД не трогаем — метадата вернётся клиенту,
   *  он потом передаст её в PATCH /items/:id { photos: [...] }.
   */
  async uploadPhoto(
    ownerId: string,
    file: Express.Multer.File,
  ): Promise<ItemPhotoResponseDto> {
    if (!file) throw new BadRequestException('file is required');

    const key = `users/${ownerId}/${randomUUID()}-${file.originalname}`;
    await this.storage.upload(key, file);

    return {
      key,
      url: this.storage.buildUrl(key),
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  // ── private ───────────────────────────────────────────────

  /** Best-effort удаление файлов из S3. Если упало — просто игнорим (orphan-байты). */
  private async deleteFromStorage(keys: string[]) {
    if (keys.length === 0) return;
    await Promise.all(
      keys.map((k) => this.storage.delete(k).catch(() => undefined)),
    );
  }
}
