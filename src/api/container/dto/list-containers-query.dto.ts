import { IsMongoId, IsOptional } from 'class-validator';

export class ListContainersQueryDto {
  @IsOptional()
  @IsMongoId()
  parent?: string;
}
