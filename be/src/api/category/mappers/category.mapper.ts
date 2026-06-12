import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoryDocument } from '../schemas/category.schema';

export class CategoryMapper {
  static toResponseDto(c: CategoryDocument): CategoryResponseDto {
    return {
      id: c._id.toString(),
      name: c.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
