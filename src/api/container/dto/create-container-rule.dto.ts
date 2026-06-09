import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { KindRuleDto } from './kind-rule.dto';

export class CreateContainerRuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  // Хотя бы одно правило обязательно — иначе создавать смысла нет
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => KindRuleDto)
  kindRules: KindRuleDto[];
}
