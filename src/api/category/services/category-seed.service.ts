import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { SEED_CATEGORIES } from '../constants/seed-categories';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategorySeedService implements OnModuleInit {
  private readonly logger = new Logger(CategorySeedService.name);

  constructor(private readonly repo: CategoryRepository) {}

  async onModuleInit() {
    const results = await Promise.all(
      SEED_CATEGORIES.map((name) => this.repo.upsertByName({ name })),
    );

    this.logger.log(`Categories seeded: ${results.length} ensured`);
  }
}
