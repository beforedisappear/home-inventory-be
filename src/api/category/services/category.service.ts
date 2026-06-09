import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ItemService } from '@/api/item/services/item.service';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryMapper } from '../mappers/category.mapper';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly repo: CategoryRepository,
    @Inject(forwardRef(() => ItemService))
    private readonly itemService: ItemService,
  ) {}

  async findAll() {
    const all = await this.repo.findAll();

    return all.map((c) => CategoryMapper.toResponseDto(c));
  }

  async findById(id: string) {
    const found = await this.repo.findById(id);

    if (!found) throw new NotFoundException('Category not found');

    return CategoryMapper.toResponseDto(found);
  }

  async assertExists(id: string) {
    const found = await this.repo.findById(id);

    if (!found) throw new NotFoundException(`Category ${id} not found`);
  }

  async create(dto: CreateCategoryDto) {
    await this.assertNameUnique(dto.name);

    const created = await this.repo.create(dto);

    return CategoryMapper.toResponseDto(created);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.repo.findById(id);

    if (!existing) throw new NotFoundException('Category not found');

    if (dto.name && dto.name !== existing.name) {
      await this.assertNameUnique(dto.name);
    }

    const updated = await this.repo.update(id, dto);

    return CategoryMapper.toResponseDto(updated!);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);

    if (!existing) throw new NotFoundException('Category not found');

    // cascade null: все items этой категории становятся "без категории"
    await this.itemService.unsetCategoryFromAll(id);

    await this.repo.delete(id);

    return { id };
  }

  private async assertNameUnique(name: string): Promise<void> {
    const dup = await this.repo.findByName(name);

    if (dup) throw new ConflictException(`Category "${name}" already exists`);
  }
}
