import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ContainerService } from '@/api/container/services/container.service';
import { StorageService } from '@/libs/storage/storage.service';

import { ItemRepository } from '../repositories/item.repository';
import { CreateItemData, UpdateItemData } from '../interfaces';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ListItemsQueryDto } from '../dto/list-items-query.dto';
import { ItemMapper } from '../mappers/item.mapper';
import { ItemPhotoService } from './item-photo.service';

@Injectable()
export class ItemService {
  constructor(
    private readonly repo: ItemRepository,
    private readonly storage: StorageService,
    private readonly photoService: ItemPhotoService,

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

    await this.repo.delete(id);

    return { id };
  }
}
