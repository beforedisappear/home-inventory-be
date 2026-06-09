import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ContainerService } from '@/api/container/services/container.service';

import { ItemRepository } from '../repositories/item.repository';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ListItemsQueryDto } from '../dto/list-items-query.dto';
import { ItemMapper } from '../mappers/item.mapper';

@Injectable()
export class ItemService {
  constructor(
    private readonly repo: ItemRepository,

    @Inject(forwardRef(() => ContainerService))
    private readonly containerService: ContainerService,
  ) {}

  existsByContainer(containerId: string) {
    return this.repo.existsByContainer(containerId);
  }

  async findByContainer(ownerId: string, query: ListItemsQueryDto) {
    await this.containerService.findById(ownerId, query.containerId);

    const items = await this.repo.findByContainer(ownerId, query.containerId);

    return items.map((item) => ItemMapper.toResponseDto(item));
  }

  async findById(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    return ItemMapper.toResponseDto(item);
  }

  async create(ownerId: string, dto: CreateItemDto) {
    await this.containerService.findById(ownerId, dto.containerId);

    const created = await this.repo.create(ownerId, dto);

    return ItemMapper.toResponseDto(created);
  }

  async update(ownerId: string, id: string, dto: UpdateItemDto) {
    await this.findById(ownerId, id);

    if (dto.containerId) {
      await this.containerService.findById(ownerId, dto.containerId);
    }

    const updated = await this.repo.update(id, dto);

    return ItemMapper.toResponseDto(updated!);
  }

  async delete(ownerId: string, id: string) {
    const item = await this.repo.findByIdAndOwner(id, ownerId);

    if (!item) throw new NotFoundException('Item not found');

    await this.repo.delete(id);

    return { id };
  }
}
