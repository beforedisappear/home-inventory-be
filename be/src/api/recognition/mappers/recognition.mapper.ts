import { RecognitionDraftDto } from '../dto/recognition-draft.dto';
import { RecognitionResponseDto } from '../dto/recognition-response.dto';
import { RecognitionDraft } from '../schemas/recognition-draft.schema';
import { RecognitionDocument } from '../schemas/recognition.schema';

export class RecognitionMapper {
  static toResponseDto(doc: RecognitionDocument): RecognitionResponseDto {
    return {
      id: doc._id.toString(),
      status: doc.status,
      draft: this.toDraftDto(doc.draft),
      error: doc.error,
      createdAt: doc.createdAt,
      completedAt: doc.completedAt,
    };
  }

  private static toDraftDto(
    draft: RecognitionDraft | null,
  ): RecognitionDraftDto | null {
    if (!draft) return null;

    return {
      name: draft.name,
      description: draft.description,
      categoryId: draft.categoryId ? draft.categoryId.toString() : null,
      categoryName: draft.categoryName,
      customFields: draft.customFields.map((f) => ({
        key: f.key,
        type: f.type,
        value: f.value,
      })),
    };
  }
}
