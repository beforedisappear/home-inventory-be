import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class ItemPhotoDto {
  @IsString()
  @MinLength(1)
  key: string;

  @IsString()
  mimeType: string;

  @IsInt()
  @Min(0)
  size: number;
}
