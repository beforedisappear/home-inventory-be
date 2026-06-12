import { DOCUMENT_MIME_TO_EXT, DOCUMENT_TYPES } from '../constants/document';

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type DocumentMime = keyof typeof DOCUMENT_MIME_TO_EXT;
