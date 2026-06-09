import { IsInt, IsString, Min, MinLength } from 'class-validator';

/**
 *  Input shape: что клиент шлёт в PATCH /items/:id { photos: [...] }.
 *  url здесь нет — сервер сам построит на ответ через StorageService.buildUrl(key).
 *  Клиент получает все эти поля из ответа на POST /items/photo.
 */
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
