import { IsDate, IsMongoId, IsString } from 'class-validator';

export class CategoryResponseDto {
  @IsMongoId()
  id: string;

  @IsString()
  name: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
