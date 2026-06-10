import { ItemQrResponseDto } from '../dto/item-qr-response.dto';
import { ItemResponseDto } from '../dto/item-response.dto';
import { ItemDocument } from '../schemas/item.schema';

export class ItemMapper {
  static toResponseDto(
    doc: ItemDocument,
    buildUrl: (key: string) => string,
  ): ItemResponseDto {
    return {
      id: doc._id.toString(),
      containerId: doc.containerId.toString(),
      categoryId: doc.categoryId?.toString() ?? null,
      name: doc.name,
      quantity: doc.quantity,
      description: doc.description,
      photos: doc.photos.map((p) => ({
        key: p.key,
        url: buildUrl(p.key),
        mimeType: p.mimeType,
        size: p.size,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toQrResponseDto(
    doc: ItemDocument,
    buildUrl: (key: string) => string,
  ): ItemQrResponseDto {
    return {
      status: doc.qrStatus,
      url: doc.qrKey ? buildUrl(doc.qrKey) : null,
    };
  }
}
