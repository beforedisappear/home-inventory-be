import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ItemModule } from '@/api/item/item.module';

import { CategoryController } from './controllers/category.controller';
import { CategoryRepository } from './repositories/category.repository';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategorySeedService } from './services/category-seed.service';
import { CategoryService } from './services/category.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    // forwardRef: ItemModule импортирует CategoryModule (для валидации categoryId)
    forwardRef(() => ItemModule),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, CategorySeedService],
  exports: [CategoryService],
})
export class CategoryModule {}
