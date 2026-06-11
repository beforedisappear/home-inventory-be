import { DocumentResponseDto } from '../dto/document-response.dto';
import { DocumentDocument } from '../schemas/document.schema';

export class DocumentMapper {
  static toResponseDto(
    doc: DocumentDocument,
    buildUrl: (key: string) => string,
  ): DocumentResponseDto {
    return {
      id: doc._id.toString(),
      itemId: doc.itemId.toString(),
      type: doc.type,
      name: doc.name,
      description: doc.description,
      warrantyEndsAt: doc.warrantyEndsAt,
      file: {
        key: doc.fileKey,
        url: buildUrl(doc.fileKey),
        mimeType: doc.fileMime,
        size: doc.fileSize,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
