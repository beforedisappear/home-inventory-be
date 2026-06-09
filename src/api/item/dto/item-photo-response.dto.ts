import { IsInt, IsString, IsUrl, Min } from 'class-validator';

/** Response shape: + url который сервер вычисляет через StorageService.buildUrl(key). */
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
