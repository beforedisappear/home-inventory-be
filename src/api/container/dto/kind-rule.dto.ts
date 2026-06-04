import { IsArray, IsBoolean, IsIn } from 'class-validator';

import {
  CONTAINER_KIND,
  type ContainerKind,
} from '../schemas/container.schema';

/**
 *  Один пункт правила: для какого kind и куда его можно класть.
 *  Используется как input при create ContainerRule и как поле в response.
 */
export class KindRuleDto {
  @IsIn(CONTAINER_KIND)
  kind: ContainerKind;

  @IsBoolean()
  canBeInsideRoot: boolean;

  @IsArray()
  @IsIn(CONTAINER_KIND, { each: true })
  allowedParents: ContainerKind[];
}
