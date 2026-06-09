import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { ContainerService } from '@/api/container/services/container.service';
import { StorageService } from '@/libs/storage/storage.service';

import { ItemRepository } from '../repositories/item.repository';
import { CreateItemData, UpdateItemData } from '../interfaces';
import { userStoragePrefix } from '../constants/storage-keys';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ListItemsQueryDto } from '../dto/list-items-query.dto';
import { ItemPhotoResponseDto } from '../dto/item-photo-response.dto';
import { ItemPhoto } from '../schemas/item-photo.schema';
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

    const { photos: photoKeys, ...rest } = dto;

    const photos = photoKeys
      ? await this.resolvePhotos(ownerId, [], photoKeys)
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
      payload.photos = await this.resolvePhotos(
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

    await this.deleteFromStorage(item.photos.map((p) => p.key));

    await this.repo.delete(id);

    return { id };
  }

  async uploadPhoto(
    ownerId: string,
    file: Express.Multer.File,
  ): Promise<ItemPhotoResponseDto> {
    if (!file) throw new BadRequestException('file is required');

    const key = `${userStoragePrefix(ownerId)}${uuidv4()}-${file.originalname}`;

    await this.storage.upload(key, file);

    return {
      key,
      url: this.storage.buildUrl(key),
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  private async resolvePhotos(
    ownerId: string,
    existing: ItemPhoto[],
    nextKeys: string[],
  ): Promise<ItemPhoto[]> {
    const existingMap = new Map(existing.map((p) => [p.key, p]));
    const nextSet = new Set(nextKeys);

    // удалённые из S3
    const removed = existing
      .filter((p) => !nextSet.has(p.key))
      .map((p) => p.key);
    await this.deleteFromStorage(removed);

    // resolve по порядку
    return Promise.all(
      nextKeys.map(async (key) => {
        const existed = existingMap.get(key);
        if (existed) return existed;

        this.assertOwnsKey(ownerId, key);

        try {
          const meta = await this.storage.head(key);
          return { key, mimeType: meta.mimeType, size: meta.size };
        } catch {
          throw new BadRequestException(`photo not found in storage: ${key}`);
        }
      }),
    );
  }

  private assertOwnsKey(ownerId: string, key: string) {
    if (!key.startsWith(userStoragePrefix(ownerId))) {
      throw new BadRequestException('photo key does not belong to user');
    }
  }

  private async deleteFromStorage(keys: string[]) {
    if (keys.length === 0) return;
    await Promise.all(
      keys.map((k) => this.storage.delete(k).catch(() => undefined)),
    );
  }
}
