import { OmitType } from '@nestjs/swagger';

import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemPhoto } from '../schemas/item-photo.schema';

export class UpdateItemData extends OmitType(UpdateItemDto, [
  'photos',
] as const) {
  photos?: ItemPhoto[];
}
