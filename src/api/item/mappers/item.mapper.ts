import { ItemDocument } from '../schemas/item.schema';
import { ItemResponseDto } from '../dto/item-response.dto';

export class ItemMapper {
  static toResponseDto(doc: ItemDocument): ItemResponseDto {
    return {
      id: doc._id.toString(),
      containerId: doc.containerId.toString(),
      name: doc.name,
      quantity: doc.quantity,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
