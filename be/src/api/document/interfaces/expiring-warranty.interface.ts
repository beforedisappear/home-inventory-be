import { DocumentType } from './document.types';

export interface ExpiringWarranty {
  documentId: string;
  itemId: string;
  ownerId: string;
  type: DocumentType;
  warrantyEndsAt: Date;
}
