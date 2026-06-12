import { IsMongoId } from 'class-validator';

export class MoveContainerDto {
  @IsMongoId()
  parentId: string;
}
