import { IsDate, IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

import {
  CONTAINER_KIND,
  type ContainerKind,
} from '../schemas/container.schema';

export class ContainerResponseDto {
  @IsMongoId()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsIn(CONTAINER_KIND)
  kind: ContainerKind | null;

  @IsOptional()
  @IsMongoId()
  parentId: string | null;

  @IsOptional()
  @IsMongoId()
  rootId: string | null;

  @IsOptional()
  @IsMongoId()
  ruleId: string | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
