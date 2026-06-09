import {
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ItemResponseDto {
  @IsMongoId()
  id: string;

  @IsMongoId()
  containerId: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
