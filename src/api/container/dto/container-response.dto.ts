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
  parent: string | null;

  @IsOptional()
  @IsMongoId()
  rule: string | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
