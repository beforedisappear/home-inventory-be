import { DocumentType } from './document.types';

export interface UpdateDocumentData {
  type?: DocumentType;
  name?: string;
  description?: string;
  warrantyEndsAt?: Date | null;
}
