import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ContainerRepository } from '../repositories/container.repository';
import { ContainerRuleRepository } from '../repositories/container-rule.repository';
import { CreateContainerDto } from '../dto/create-container.dto';
import { UpdateContainerDto } from '../dto/update-container.dto';
import { MoveContainerDto } from '../dto/move-container.dto';
import { ContainerMapper } from '../mappers/container.mapper';

@Injectable()
export class ContainerService {
  constructor(
    private readonly repo: ContainerRepository,
    private readonly ruleRepo: ContainerRuleRepository,
  ) {}

  /** Прямые дети уровня. parentId === null → root-контейнеры */
  async findChildren(ownerId: string, parentId: string | null) {
    const containers = await this.repo.findChildrenByOwner(ownerId, parentId);

    return containers.map((c) => ContainerMapper.toResponseDto(c));
  }

  async findById(ownerId: string, id: string) {
    const container = await this.repo.findById(id);

    if (!container || container.owner.toString() !== ownerId)
      throw new NotFoundException('Container not found');

    return ContainerMapper.toResponseDto(container);
  }

  async create(ownerId: string, dto: CreateContainerDto) {
    const isRoot = !dto.parentId;

    if (isRoot) {
      if (dto.kind)
        throw new BadRequestException('kind invalid for the root container');

      // если задан ruleId — проверяем что правило существует и принадлежит юзеру
      if (dto.ruleId) {
        const rule = await this.ruleRepo.findByIdAndOwner(dto.ruleId, ownerId);
        if (!rule) throw new NotFoundException('ContainerRule not found');
      }

      const created = await this.repo.create(ownerId, dto);

      return ContainerMapper.toResponseDto(created);
    }

    if (!dto.kind)
      throw new BadRequestException('kind is required for child containers');

    if (dto.ruleId)
      throw new BadRequestException(
        'ruleId is not allowed for child containers',
      );

    // parent существует и принадлежит этому юзеру
    const parent = await this.repo.findById(dto.parentId!);

    if (!parent || parent.owner.toString() !== ownerId) {
      throw new NotFoundException('Parent not found');
    }

    const created = await this.repo.create(ownerId, {
      ...dto,
      ruleId: parent.rule?.toString() ?? undefined,
    });

    return ContainerMapper.toResponseDto(created);
  }

  async update(ownerId: string, id: string, dto: UpdateContainerDto) {
    // проверка существования + owner
    await this.findById(ownerId, id);

    const updated = await this.repo.update(id, dto);
    return ContainerMapper.toResponseDto(updated!);
  }

  async delete(ownerId: string, id: string) {
    const container = await this.repo.findById(id);

    if (!container || container.owner.toString() !== ownerId)
      throw new NotFoundException('Container not found');

    // не пускаем удалять не-пустой контейнер — юзер должен сначала разобрать содержимое
    const childrenCount = await this.repo.countChildren(id);

    if (childrenCount > 0)
      throw new ConflictException(
        `Container has ${childrenCount} child container(s)`,
      );

    // TODO: когда добавим Item, дополнительно проверять что Item.find({ container: id }).count() === 0

    await this.repo.delete(id);

    return { id };
  }

  async move(ownerId: string, id: string, dto: MoveContainerDto) {
    const node = await this.repo.findById(id);

    if (!node || node.owner.toString() !== ownerId)
      throw new NotFoundException('Container not found');

    if (!node.parent)
      throw new BadRequestException(
        'Root container cannot be moved (delete and recreate instead)',
      );

    if (id === dto.parentId)
      throw new BadRequestException('Cannot move container into itself');

    const newParent = await this.repo.findById(dto.parentId);

    if (!newParent || newParent.owner.toString() !== ownerId)
      throw new NotFoundException('New parent not found');

    // защита от цикла: новый parent не должен быть в поддереве перемещаемого узла
    const subtreeIds = await this.repo.findSubtreeIds(id);

    if (subtreeIds.includes(dto.parentId))
      throw new BadRequestException(
        'Cannot move container into its own descendant',
      );

    // меняем parent
    await this.repo.updateParent(id, dto.parentId);

    // если у нового parent другой rule — каскадно обновляем поддерево
    const newRule = newParent.rule?.toString() ?? null;

    const currentRule = node.rule?.toString() ?? null;

    if (newRule !== currentRule) {
      await this.repo.setRuleOnIds(subtreeIds, newRule);
    }

    return this.findById(ownerId, id);
  }
}
