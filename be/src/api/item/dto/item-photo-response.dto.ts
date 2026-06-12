import { IsInt, IsString, IsUrl, Min } from 'class-validator';

export class ItemPhotoResponseDto {
  @IsString()
  key: string;

  @IsUrl()
  url: string;

  @IsString()
  mimeType: string;

  @IsInt()
  @Min(0)
  size: number;
}
