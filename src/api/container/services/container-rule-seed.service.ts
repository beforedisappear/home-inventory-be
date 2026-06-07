import { Injectable, OnModuleInit } from '@nestjs/common';

import { ContainerRuleRepository } from '../repositories/container-rule.repository';
import {
  DEFAULT_RULE_NAME,
  buildDefaultKindRules,
} from '../constants/default-rule';

@Injectable()
export class ContainerRuleSeedService implements OnModuleInit {
  constructor(private readonly repo: ContainerRuleRepository) {}

  async onModuleInit() {
    await this.repo.upsert({
      ownerId: null,
      name: DEFAULT_RULE_NAME,
      kindRules: buildDefaultKindRules(),
    });
  }
}
