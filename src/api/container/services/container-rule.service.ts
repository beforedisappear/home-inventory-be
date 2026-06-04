import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

import { ContainerRuleRepository } from '../repositories/container-rule.repository';
import { CreateContainerRuleDto } from '../dto/create-container-rule.dto';
import { ContainerRuleMapper } from '../mappers/container-rule.mapper';
import {
  DEFAULT_RULE_NAME,
  buildDefaultKindRules,
} from '../constants/default-rule';

@Injectable()
export class ContainerRuleService {
  constructor(private readonly repo: ContainerRuleRepository) {}

  async findByOwner(ownerId: string) {
    let rules = await this.repo.findByOwner(ownerId);

    // Bootstrap: если у юзера ни одного правила — атомарно создаём дефолтное.
    // upsert безопасен относительно concurrent-запросов: второй просто увидит готовый док.
    if (rules.length === 0) {
      await this.repo.upsert({
        owner: ownerId,
        name: DEFAULT_RULE_NAME,
        kindRules: buildDefaultKindRules(),
      });
      rules = await this.repo.findByOwner(ownerId);
    }

    return rules.map((r) => ContainerRuleMapper.toResponseDto(r));
  }

  async findById(ownerId: string, id: string) {
    const rule = await this.repo.findByIdAndOwner(id, ownerId);

    if (!rule) throw new NotFoundException('ContainerRule not found');

    return ContainerRuleMapper.toResponseDto(rule);
  }

  async create(ownerId: string, dto: CreateContainerRuleDto) {
    try {
      const created = await this.repo.create({
        owner: ownerId,
        name: dto.name,
        kindRules: dto.kindRules,
      });

      return ContainerRuleMapper.toResponseDto(created);
    } catch (err) {
      // unique index { owner: 1, name: 1 } — дубль имени
      if (err instanceof MongoServerError && err.code === 11000) {
        throw new ConflictException(
          `Rule with name "${dto.name}" already exists`,
        );
      }
      throw err;
    }
  }
}
