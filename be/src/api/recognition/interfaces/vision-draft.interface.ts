import type {
  CustomFieldType,
  CustomFieldValue,
} from '@/api/item/interfaces/custom-field.types';

export interface VisionDraftCustomField {
  key: string;
  type: CustomFieldType;
  value: CustomFieldValue;
}

export interface VisionDraft {
  name: string;
  description: string | null;
  categoryName: string | null;
  customFields: VisionDraftCustomField[];
}
