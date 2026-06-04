import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateContainerDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name?: string;
}
