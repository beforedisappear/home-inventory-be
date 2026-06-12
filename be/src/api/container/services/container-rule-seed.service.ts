import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  buildDefaultKindRules,
  DEFAULT_RULE_NAME,
} from '../constants/default-rule';
import { ContainerRuleRepository } from '../repositories/container-rule.repository';

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
