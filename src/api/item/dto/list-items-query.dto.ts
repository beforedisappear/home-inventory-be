import { IsMongoId } from 'class-validator';

export class ListItemsQueryDto {
  @IsMongoId()
  containerId: string;
}
