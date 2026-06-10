import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CategoryService } from '@/api/category/services/category.service';
import { ContainerService } from '@/api/container/services/container.service';
import { StorageService } from '@/libs/storage/storage.service';

import { CreateItemDto } from '../dto/create-item.dto';
import { ListItemsQueryDto } from '../dto/list-items-query.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { CreateItemData, UpdateItemData } from '../interfaces';
import { ItemMapper } from '../mappers/item.mapper';
import { ItemRepository } from '../repositories/item.repository';
import { ItemPhotoService } from './item-photo.service';
import { ItemQrService } from './item-qr.service';

@Injectable()
export class ItemService {
  constructor(
    private readonly repo: ItemRepository,
    private readonly storage: StorageService,
    private readonly photoService: ItemPhotoService,
    private readonly qrService: ItemQrService,

    @Inject(forwardRef(() => ContainerService))
    private readonly containerService: ContainerService,

    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
  ) {}

  existsByContainer(containerId: string) {
    return this.repo.existsByContainer(containerId);
  }

  unsetCategoryFromAll(categoryId: string) {
    return this.repo.unsetCategoryFromAll(categoryId);
  }

  async findAll(ownerId: string, query: ListItemsQueryDto) {
    if (query.containerId) {
      await this.containerService.findById(ownerId, query.containerId);
    }

    if (query.categoryId) {
      await this.categoryService.assertExists(query.categoryId);
    }

    const items = await this.repo.findAll(ownerId, query);

    return items.map((i) => ItemMapper.toResponseDto(i, this.storage.buildUrl));
  }

  async findById(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    return ItemMapper.toResponseDto(item, this.storage.buildUrl);
  }

  async create(ownerId: string, dto: CreateItemDto) {
    await this.containerService.findById(ownerId, dto.containerId);

    if (dto.categoryId) {
      await this.categoryService.assertExists(dto.categoryId);
    }

    const { photos: photoKeys, ...rest } = dto;

    const photos = photoKeys
      ? await this.photoService.resolve(ownerId, [], photoKeys)
      : [];

    const payload: CreateItemData = { ...rest, ownerId, photos };

    const created = await this.repo.create(payload);

    return ItemMapper.toResponseDto(created, this.storage.buildUrl);
  }

  async update(ownerId: string, id: string, dto: UpdateItemDto) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);
    if (!item) throw new NotFoundException('Item not found');

    if (dto.containerId) {
      await this.containerService.findById(ownerId, dto.containerId);
    }

    if (dto.categoryId) {
      await this.categoryService.assertExists(dto.categoryId);
    }

    const { photos: photoKeys, ...rest } = dto;

    const payload: UpdateItemData = { ...rest };

    if (photoKeys !== undefined) {
      payload.photos = await this.photoService.resolve(
        ownerId,
        item.photos,
        photoKeys,
      );
    }

    const updated = await this.repo.update(id, payload);

    return ItemMapper.toResponseDto(updated!, this.storage.buildUrl);
  }

  async delete(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    await this.photoService.deleteAll(item.photos.map((p) => p.key));
    await this.qrService.deleteIfExists(item.qrKey);

    await this.repo.delete(id);

    return { id };
  }

  async getQr(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    return ItemMapper.toQrResponseDto(item, this.storage.buildUrl);
  }

  async generateQr(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    await this.qrService.enqueueGenerate(id, ownerId);

    // отражаем новое состояние сразу, не делая лишний read
    item.qrStatus = 'pending';

    return ItemMapper.toQrResponseDto(item, this.storage.buildUrl);
  }
}
