import { DocumentType } from './document.types';

export interface CreateDocumentData {
  ownerId: string;
  itemId: string;
  type: DocumentType;
  name?: string;
  description?: string;
  warrantyEndsAt: Date | null;
  fileKey: string;
  fileMime: string;
  fileSize: number;
}
