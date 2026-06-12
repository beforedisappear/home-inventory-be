import { OmitType } from '@nestjs/swagger';

import { CreateItemDto } from '../dto/create-item.dto';
import { ItemPhoto } from '../schemas/item-photo.schema';

export class CreateItemData extends OmitType(CreateItemDto, [
  'photos',
] as const) {
  ownerId: string;
  photos?: ItemPhoto[];
}
