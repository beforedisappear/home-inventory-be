import {
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  CONTAINER_KIND,
  type ContainerKind,
} from '../schemas/container.schema';

export class CreateContainerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  // null/undefined → root-контейнер
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  // kind задаётся только для child'ов. Service отвергает kind на root.
  @IsOptional()
  @IsIn(CONTAINER_KIND)
  kind?: ContainerKind;

  // ruleId задаётся только для root. Service отвергает ruleId на child.
  @IsOptional()
  @IsMongoId()
  ruleId?: string;
}
