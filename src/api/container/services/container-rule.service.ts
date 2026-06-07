import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

import { ContainerRuleRepository } from '../repositories/container-rule.repository';
import { CreateContainerRuleDto } from '../dto/create-container-rule.dto';
import { ContainerRuleMapper } from '../mappers/container-rule.mapper';
import type { ContainerRuleDocument } from '../schemas/container-rule.schema';

@Injectable()
export class ContainerRuleService {
  constructor(private readonly repo: ContainerRuleRepository) {}

  async findByOwner(ownerId: string) {
    const rules = await this.repo.findByOwner(ownerId);

    return rules.map((r) => ContainerRuleMapper.toResponseDto(r));
  }

  async findById(ownerId: string, id: string) {
    const rule = await this.findDocumentById(ownerId, id);

    return ContainerRuleMapper.toResponseDto(rule);
  }

  async findDocumentById(
    ownerId: string,
    id: string,
  ): Promise<ContainerRuleDocument> {
    const rule = await this.repo.findByIdAndOwner(id, ownerId);

    if (!rule) throw new NotFoundException('ContainerRule not found');

    return rule;
  }

  async create(ownerId: string, dto: CreateContainerRuleDto) {
    try {
      const created = await this.repo.create({
        ownerId,
        name: dto.name,
        kindRules: dto.kindRules,
      });

      return ContainerRuleMapper.toResponseDto(created);
    } catch (err) {
      // unique index { ownerId: 1, name: 1 } — дубль имени
      if (err instanceof MongoServerError && err.code === 11000) {
        throw new ConflictException(
          `Rule with name "${dto.name}" already exists`,
        );
      }
      throw err;
    }
  }
}
